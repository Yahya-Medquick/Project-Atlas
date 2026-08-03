import React, { createContext, useContext, useState, useEffect } from "react";
import { UserAuth, UserProfile, TabUsage, CategoryType } from "../types";
import { fetchCurrentUser, googleLogin, logoutUser, fetchTabUsage } from "../services/api";

interface UserContextType {
  user: UserAuth | null;
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  profile: UserProfile;
  loginWithGoogle: (payload: { idToken?: string; credential?: string; email?: string; name?: string; avatarUrl?: string }) => Promise<void>;
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
  loginWithGoogle: async () => {},
  logout: async () => {},
  checkUsage: async () => null,
  updateProfile: async () => {},
  updatePreferences: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    async function loadUserSession() {
      try {
        const authUser = await fetchCurrentUser();
        if (authUser) {
          setUser(authUser);
          setProfile((prev) => ({
            ...prev,
            name: authUser.name || prev.name,
            email: authUser.email || prev.email,
          }));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn("User session load error:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    loadUserSession();
  }, []);

  const loginWithGoogle = async (payload: { idToken?: string; credential?: string; email?: string; name?: string; avatarUrl?: string }) => {
    try {
      const res = await googleLogin(payload);
      if (res.user) {
        setUser(res.user);
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

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
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
        loginWithGoogle,
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
