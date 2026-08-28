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

        setUsage({
          isLoggedIn,
          tier: isLoggedIn ? 'free' : 'logged_out',
          count: isLoggedIn ? serverAccountCount : serverDeviceCount,
          limit: isLoggedIn ? ACCOUNT_DAILY_LIMIT : DEVICE_DAILY_LIMIT,
          remaining: effectiveRemaining,
          resetInSeconds: data.resetInSeconds || getUtcMidnightSeconds(),
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
      setUsage({
        isLoggedIn: false,
        tier: 'logged_out',
        count: deviceCount,
        limit: DEVICE_DAILY_LIMIT,
        remaining: deviceRemaining,
        resetInSeconds: getUtcMidnightSeconds(),
      });
      return;
    }

    const userKey = `bifrost_user_usage_${user.id}_${today}`;
    const userCount = parseInt(localStorage.getItem(userKey) || '0', 10);
    const accountRemaining = Math.max(0, ACCOUNT_DAILY_LIMIT - userCount);
    const effectiveRemaining = Math.min(deviceRemaining, accountRemaining);

    setUsage({
      isLoggedIn: true,
      tier: 'free',
      count: userCount,
      limit: ACCOUNT_DAILY_LIMIT,
      remaining: effectiveRemaining,
      resetInSeconds: getUtcMidnightSeconds(),
    });
  }, [isLoggedIn, user]);

  useEffect(() => {
    syncUsage();
  }, [syncUsage]);

  const canExecuteQuery = useCallback((): boolean => {
    if (user?.tier === 'paid') return true;
    return usage.remaining > 0;
  }, [user?.tier, usage.remaining]);

  const recordQueryExecution = useCallback((): boolean => {
    if (user?.tier === 'paid') return true;

    if (!canExecuteQuery()) {
      setIsPaywallOpen(true);
      return false;
    }

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

    syncUsage();
    return true;
  }, [canExecuteQuery, isLoggedIn, user, syncUsage]);

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
