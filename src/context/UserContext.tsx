import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "../types";

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserProfile["preferences"]>) => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: "Alex Vance",
  email: "doctordiet78f@gmail.com",
  role: "Researcher",
  savedSearches: ["Gravity", "Quantum Computing", "General Relativity"],
  recentSearches: [],
  preferences: {
    defaultSort: "relevance",
    autoExpandSynonyms: true,
    compactView: false,
  },
};

const UserContext = createContext<UserContextType>({
  profile: defaultProfile,
  updateProfile: async () => {},
  updatePreferences: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("atlas_user_profile");
        return saved ? JSON.parse(saved) : defaultProfile;
      } catch (e) {
        return defaultProfile;
      }
    }
    return defaultProfile;
  });

  useEffect(() => {
    async function loadUserSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setProfile(data.user);
            localStorage.setItem("atlas_user_profile", JSON.stringify(data.user));
          }
        }
      } catch (err) {
        console.warn("User session sync warning:", err);
      }
    }
    loadUserSession();
  }, []);

  const updateProfile = async (updated: Partial<UserProfile>) => {
    const next = { ...profile, ...updated };
    setProfile(next);
    localStorage.setItem("atlas_user_profile", JSON.stringify(next));

    try {
      await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch (err) {
      console.warn("Failed to persist user profile:", err);
    }
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
    localStorage.setItem("atlas_user_profile", JSON.stringify(next));

    try {
      await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
    } catch (err) {
      console.warn("Failed to persist user preferences:", err);
    }
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile, updatePreferences }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
