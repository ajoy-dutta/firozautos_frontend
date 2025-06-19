"use client";
import { createContext, useState, useContext, useEffect } from "react";
import AxiosInstance from "../components/AxiosInstance";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    if (!token) {
      console.warn("No token found. Skipping fetch.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await AxiosInstance.get("user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
      console.log('user',response.data)
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (err) {
      console.error("Error fetching user:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to fetch user.");
      // 👇 Only log out if it's clearly a 401 or bad token
      if (err.response?.status === 401) {
        signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = () => {
    const storedToken = localStorage.getItem("access_token");
    setToken(storedToken); // this will retrigger fetchUserData via useEffect
  };

  const signOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };
  
  

  useEffect(() => {
    if (token && !user) {
      fetchUserData();
    }
  }, [token]); // 👈 token is now reactive

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser, signOut }}>
      {loading ? <div>Loading...</div> : children}
    </UserContext.Provider>
  );
};
