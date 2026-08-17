import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAuth, UserProfile, TabUsage, CategoryType } from "../types";
import { fetchCurrentUser, googleLogin, logoutUser, fetchTabUsage, registerUser, verifyEmail, loginWithEmail, updatePreferencesMode } from "../services/api";

interface UserContextType {
  user: UserAuth | null;
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  profile: UserProfile;
  mode: "research" | "learning";
  toggleMode: () => void;
  setMode: (mode: "research" | "learning") => void;
  loginWithGoogle: (payload: { idToken?: string; credential?: string; email?: string; name?: string; avatarUrl?: string }) => Promise<void>;
  registerUser: (email: string, name: string) => Promise<{ message: string }>;
  verifyEmail: (token: string, password: string) => Promise<UserAuth>;
  loginWithEmail: (email: string, password: string) => Promise<UserAuth>;
  logout: () => Promise<void>;
  checkUsage: (tab: CategoryType) => Promise<TabUsage | null>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserProfile["preferences"]>) => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: "Guest User",
  email: "guest@bifrost.ai",
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
  isLoadingAuth: true,
  profile: defaultProfile,
  mode: "research",
  toggleMode: () => {},
  setMode: () => {},
  loginWithGoogle: async () => {},
  registerUser: async () => ({ message: "" }),
  verifyEmail: async () => ({} as UserAuth),
  loginWithEmail: async () => ({} as UserAuth),
  logout: async () => {},
  checkUsage: async () => null,
  updateProfile: async () => {},
  updatePreferences: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
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
          if (authUser.preferred_mode) {
            setMode(authUser.preferred_mode);
          }
          setProfile((prev) => ({
            ...prev,
            name: authUser.name || prev.name,
            email: authUser.email || prev.email,
          }));
        } else {
          setUser(null);
          // When not logged in, read from localStorage
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

  const loginWithGoogle = async (payload: { idToken?: string; credential?: string; email?: string; name?: string; avatarUrl?: string }) => {
    try {
      const res = await googleLogin(payload);
      if (res.user) {
        setUser(res.user);
        if (res.user.preferred_mode) {
          setMode(res.user.preferred_mode);
        }
        setProfile((prev) => ({
          ...prev,
          name: res.user.name,
          email: res.user.email,
        }));
      }
    } catch (err) {
      console.error("Login with Google failed:", err);
      throw err;
    }
  };

  const handleRegisterUser = async (email: string, name: string) => {
    return await registerUser(email, name);
  };

  const handleVerifyEmail = async (token: string, password: string) => {
    try {
      const authUser = await verifyEmail(token, password);
      if (authUser) {
        setUser(authUser);
        if (authUser.preferred_mode) {
          setMode(authUser.preferred_mode);
        }
        setProfile((prev) => ({
          ...prev,
          name: authUser.name,
          email: authUser.email,
        }));
      }
      return authUser;
    } catch (err) {
      console.error("Email verification failed in context:", err);
      throw err;
    }
  };

  const handleLoginWithEmail = async (email: string, password: string) => {
    try {
      const authUser = await loginWithEmail(email, password);
      if (authUser) {
        setUser(authUser);
        if (authUser.preferred_mode) {
          setMode(authUser.preferred_mode);
        }
        setProfile((prev) => ({
          ...prev,
          name: authUser.name,
          email: authUser.email,
        }));
      }
      return authUser;
    } catch (err) {
      console.error("Login with email failed in context:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setMode("research");
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
        isLoadingAuth,
        profile,
        mode,
        toggleMode,
        setMode: setModeExplicit,
        loginWithGoogle,
        registerUser: handleRegisterUser,
        verifyEmail: handleVerifyEmail,
        loginWithEmail: handleLoginWithEmail,
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
