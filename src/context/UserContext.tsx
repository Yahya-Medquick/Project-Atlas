import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAuth, UserProfile, TabUsage, CategoryType } from "../types";
import {
  fetchCurrentUser,
  logoutUser,
  fetchTabUsage,
  registerWithPhone,
  loginWithCredentials,
  verifyNewDevice,
  LoginResult,
  updatePreferencesMode
} from "../services/api";

interface UserContextType {
  user: UserAuth | null;
  isLoggedIn: boolean;
  isGuest: boolean;
  isLoadingAuth: boolean;
  profile: UserProfile;
  mode: "research" | "learning";
  toggleMode: () => void;
  setMode: (mode: "research" | "learning") => void;
  registerUser: (payload: { username: string; password: string; phone: string }) => Promise<UserAuth>;
  loginUser: (username: string, password: string) => Promise<LoginResult>;
  verifyNewDeviceUser: (payload: { username: string; password: string; phone: string }) => Promise<UserAuth>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  checkUsage: (tab: CategoryType) => Promise<TabUsage | null>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserProfile["preferences"]>) => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: "Guest Explorer",
  username: "guest",
  phone: "",
  email: "",
  role: "Explorer",
  savedSearches: [],
  recentSearches: [],
  preferences: {
    defaultSort: "relevance",
    autoExpandSynonyms: true,
    compactView: false,
  },
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoggedIn: false,
  isGuest: false,
  isLoadingAuth: true,
  profile: defaultProfile,
  mode: "research",
  toggleMode: () => {},
  setMode: () => {},
  registerUser: async () => ({} as UserAuth),
  loginUser: async () => ({}),
  verifyNewDeviceUser: async () => ({} as UserAuth),
  continueAsGuest: () => {},
  logout: async () => {},
  checkUsage: async () => null,
  updateProfile: async () => {},
  updatePreferences: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem("bifrost_guest_mode") === "true";
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [mode, setMode] = useState<"research" | "learning">(() => {
    return (localStorage.getItem("bifrost_mode") as any) || "research";
  });

  useEffect(() => {
    async function loadUserSession() {
      try {
        const authUser = await fetchCurrentUser();
        if (authUser) {
          setUser(authUser);
          setIsGuest(false);
          localStorage.removeItem("bifrost_guest_mode");
          if (authUser.preferred_mode) {
            setMode(authUser.preferred_mode);
          }
          setProfile((prev) => ({
            ...prev,
            name: authUser.name || authUser.username || prev.name,
            username: authUser.username || prev.username,
            phone: authUser.phone || prev.phone,
            email: authUser.email || prev.email,
          }));
        } else {
          setUser(null);
          const wasGuest = localStorage.getItem("bifrost_guest_mode") === "true";
          setIsGuest(wasGuest);
          const savedMode = localStorage.getItem("bifrost_mode");
          if (savedMode === "research" || savedMode === "learning") {
            setMode(savedMode);
          }
        }
      } catch (err) {
        console.warn("User session load error:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    loadUserSession();
  }, []);

  const toggleMode = async () => {
    const nextMode = mode === "research" ? "learning" : "research";
    setMode(nextMode);
    if (user) {
      try {
        await updatePreferencesMode(nextMode);
      } catch (err) {
        console.error("Failed to persist mode preference:", err);
      }
    } else {
      localStorage.setItem("bifrost_mode", nextMode);
    }
  };

  const setModeExplicit = async (nextMode: "research" | "learning") => {
    setMode(nextMode);
    if (user) {
      try {
        await updatePreferencesMode(nextMode);
      } catch (err) {
        console.error("Failed to persist mode preference:", err);
      }
    } else {
      localStorage.setItem("bifrost_mode", nextMode);
    }
  };

  const handleRegisterUser = async (payload: { username: string; password: string; phone: string }) => {
    try {
      const authUser = await registerWithPhone(payload);
      if (authUser) {
        setUser(authUser);
        setIsGuest(false);
        if (authUser.preferred_mode) {
          setMode(authUser.preferred_mode);
        }
        setProfile((prev) => ({
          ...prev,
          name: authUser.name || authUser.username || prev.name,
          username: authUser.username || prev.username,
          phone: authUser.phone || prev.phone,
        }));
      }
      return authUser;
    } catch (err) {
      console.error("Registration failed in context:", err);
      throw err;
    }
  };

  const handleLoginUser = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const result = await loginWithCredentials(username, password);
      if (result.user && !result.requiresOtp) {
        setUser(result.user);
        setIsGuest(false);
        if (result.user.preferred_mode) {
          setMode(result.user.preferred_mode);
        }
        setProfile((prev) => ({
          ...prev,
          name: result.user?.name || result.user?.username || prev.name,
          username: result.user?.username || prev.username,
          phone: result.user?.phone || prev.phone,
        }));
      }
      return result;
    } catch (err) {
      console.error("Login failed in context:", err);
      throw err;
    }
  };

  const handleVerifyNewDeviceUser = async (payload: { username: string; password: string; phone: string }) => {
    try {
      const authUser = await verifyNewDevice(payload);
      if (authUser) {
        setUser(authUser);
        setIsGuest(false);
        if (authUser.preferred_mode) {
          setMode(authUser.preferred_mode);
        }
        setProfile((prev) => ({
          ...prev,
          name: authUser.name || authUser.username || prev.name,
          username: authUser.username || prev.username,
          phone: authUser.phone || prev.phone,
        }));
      }
      return authUser;
    } catch (err) {
      console.error("Device verification failed in context:", err);
      throw err;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    localStorage.setItem("bifrost_guest_mode", "true");
    setProfile((prev) => ({
      ...prev,
      name: "Guest Explorer",
      username: "guest",
      role: "Explorer",
    }));
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsGuest(false);
      setMode("research");
      setProfile(defaultProfile);
    } catch (err) {
      console.warn("Logout error:", err);
    }
  };

  const checkUsage = async (tab: CategoryType): Promise<TabUsage | null> => {
    return await fetchTabUsage(tab);
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    const next = { ...profile, ...updated };
    setProfile(next);
  };

  const updatePreferences = async (prefs: Partial<UserProfile["preferences"]>) => {
    const next = {
      ...profile,
      preferences: {
        ...profile.preferences,
        ...prefs,
      },
    };
    setProfile(next);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isGuest,
        isLoadingAuth,
        profile,
        mode,
        toggleMode,
        setMode: setModeExplicit,
        registerUser: handleRegisterUser,
        loginUser: handleLoginUser,
        verifyNewDeviceUser: handleVerifyNewDeviceUser,
        continueAsGuest,
        logout,
        checkUsage,
        updateProfile,
        updatePreferences,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
