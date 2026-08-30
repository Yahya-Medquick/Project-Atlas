import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { QueryUsageState } from '../types/chat';
import { getOrCreateDeviceId } from '../utils/deviceFingerprint';
import { getAuthHeaders } from '../services/api';

const DEVICE_DAILY_LIMIT = 15;
const ACCOUNT_DAILY_LIMIT = 10;

function getUtcMidnightSeconds(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function getUtcTodayDate(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

export function useQueryLimits() {
  const { user, isLoggedIn } = useUser();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [usage, setUsage] = useState<QueryUsageState>(() => {
    return {
      isLoggedIn: false,
      tier: 'logged_out',
      count: 0,
      limit: DEVICE_DAILY_LIMIT,
      remaining: DEVICE_DAILY_LIMIT,
      resetInSeconds: getUtcMidnightSeconds(),
    };
  });

  const syncUsage = useCallback(async () => {
    const today = getUtcTodayDate();
    const deviceId = getOrCreateDeviceId();

    if (user?.tier === 'paid') {
      setUsage({
        isLoggedIn: true,
        tier: 'paid',
        count: 0,
        limit: 999999,
        remaining: 999999,
        resetInSeconds: 0,
      });
      return;
    }

    try {
      const res = await fetch('/api/usage', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const serverDeviceCount = data.deviceCount ?? 0;
        const serverAccountCount = data.accountCount ?? 0;
        const deviceRemaining = Math.max(0, DEVICE_DAILY_LIMIT - serverDeviceCount);
        const accountRemaining = isLoggedIn ? Math.max(0, ACCOUNT_DAILY_LIMIT - serverAccountCount) : deviceRemaining;
        const effectiveRemaining = Math.min(deviceRemaining, accountRemaining);

        setUsage(prev => {
          const isStatusChange = prev.isLoggedIn !== isLoggedIn || prev.tier !== (isLoggedIn ? 'free' : 'logged_out');
          const targetRemaining = isStatusChange ? effectiveRemaining : Math.min(prev.remaining, effectiveRemaining);
          const targetCount = isStatusChange ? (isLoggedIn ? serverAccountCount : serverDeviceCount) : Math.max(prev.count, isLoggedIn ? serverAccountCount : serverDeviceCount);

          return {
            isLoggedIn,
            tier: isLoggedIn ? 'free' : 'logged_out',
            count: targetCount,
            limit: isLoggedIn ? ACCOUNT_DAILY_LIMIT : DEVICE_DAILY_LIMIT,
            remaining: targetRemaining,
            resetInSeconds: data.resetInSeconds || getUtcMidnightSeconds(),
          };
        });
        return;
      }
    } catch (e) {
      console.warn('Failed to fetch /api/usage from server:', e);
    }

    // Local fallback if offline or server check unavailable
    const deviceKey = `bifrost_device_usage_${deviceId}_${today}`;
    const deviceCount = parseInt(localStorage.getItem(deviceKey) || '0', 10);
    const deviceRemaining = Math.max(0, DEVICE_DAILY_LIMIT - deviceCount);

    if (!isLoggedIn || !user) {
      setUsage(prev => {
        const isStatusChange = prev.isLoggedIn !== false || prev.tier !== 'logged_out';
        const targetRemaining = isStatusChange ? deviceRemaining : Math.min(prev.remaining, deviceRemaining);
        const targetCount = isStatusChange ? deviceCount : Math.max(prev.count, deviceCount);
        return {
          isLoggedIn: false,
          tier: 'logged_out',
          count: targetCount,
          limit: DEVICE_DAILY_LIMIT,
          remaining: targetRemaining,
          resetInSeconds: getUtcMidnightSeconds(),
        };
      });
      return;
    }

    const userKey = `bifrost_user_usage_${user.id}_${today}`;
    const userCount = parseInt(localStorage.getItem(userKey) || '0', 10);
    const accountRemaining = Math.max(0, ACCOUNT_DAILY_LIMIT - userCount);
    const effectiveRemaining = Math.min(deviceRemaining, accountRemaining);

    setUsage(prev => {
      const isStatusChange = prev.isLoggedIn !== true || prev.tier !== 'free';
      const targetRemaining = isStatusChange ? effectiveRemaining : Math.min(prev.remaining, effectiveRemaining);
      const targetCount = isStatusChange ? userCount : Math.max(prev.count, userCount);
      return {
        isLoggedIn: true,
        tier: 'free',
        count: targetCount,
        limit: ACCOUNT_DAILY_LIMIT,
        remaining: targetRemaining,
        resetInSeconds: getUtcMidnightSeconds(),
      };
    });
  }, [isLoggedIn, user?.id, user?.tier]);

  useEffect(() => {
    syncUsage();

    const interval = setInterval(() => {
      syncUsage();
    }, 60000);

    const handleFocus = () => {
      syncUsage();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncUsage]);

  const canExecuteQuery = useCallback((): boolean => {
    if (user?.tier === 'paid') return true;
    return usage.remaining > 0;
  }, [user?.tier, usage.remaining]);

  /**
   * CONFIRMED FLOW (Bug 1 Fix Trace):
   * 1. Query Execution: recordQueryExecution() is invoked before/during message dispatch.
   * 2. Synchronous Local Decrement: setUsage immediately decrements local remaining by 1 and increments count by 1.
   * 3. Local Storage Cache: Synchronously persists updated counts into localStorage for device & user keys.
   * 4. Decoupled Network Sync: Immediate syncUsage() network call is removed from this execution path.
   * 5. Safe Monotonic Sync: When syncUsage() runs periodically or on window focus, it applies a monotonic
   *    merge rule (remaining = min(localRemaining, serverRemaining)), preventing stale server responses
   *    from ever overwriting or incrementing the local remaining count mid-session.
   */
  const recordQueryExecution = useCallback((): boolean => {
    if (user?.tier === 'paid') return true;

    if (!canExecuteQuery()) {
      setIsPaywallOpen(true);
      return false;
    }

    // Synchronous immediate decrement for real-time UI responsiveness
    setUsage(prev => {
      const nextRemaining = Math.max(0, prev.remaining - 1);
      const nextCount = prev.count + 1;
      return {
        ...prev,
        count: nextCount,
        remaining: nextRemaining,
      };
    });

    const today = getUtcTodayDate();
    const deviceId = getOrCreateDeviceId();

    // Increment local device usage cache
    const deviceKey = `bifrost_device_usage_${deviceId}_${today}`;
    const devCount = (parseInt(localStorage.getItem(deviceKey) || '0', 10) || 0) + 1;
    localStorage.setItem(deviceKey, String(devCount));

    if (isLoggedIn && user) {
      const userKey = `bifrost_user_usage_${user.id}_${today}`;
      const userCount = (parseInt(localStorage.getItem(userKey) || '0', 10) || 0) + 1;
      localStorage.setItem(userKey, String(userCount));
    }

    return true;
  }, [canExecuteQuery, isLoggedIn, user]);

  const triggerPaywall = useCallback(() => {
    setIsPaywallOpen(true);
  }, []);

  const closePaywall = useCallback(() => {
    setIsPaywallOpen(false);
  }, []);

  return {
    usage,
    canExecuteQuery,
    recordQueryExecution,
    isPaywallOpen,
    triggerPaywall,
    closePaywall,
    refreshUsage: syncUsage,
  };
}
