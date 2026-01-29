import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext({});

// Map Firebase auth error codes to user-friendly messages
export const getAuthErrorMessage = (error) => {
  if (!error || !error.code) return error?.message || "An error occurred";
  const messages = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "This email is already registered. Try signing in.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection.",
  };
  return messages[error.code] || error.message;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setSession(firebaseUser ? { user: firebaseUser } : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: newUser } = userCredential;
      if (metadata.displayName || metadata.full_name) {
        await updateProfile(newUser, {
          displayName: metadata.displayName || metadata.full_name || "",
        });
      }
      return { data: { user: newUser }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { data: { user: userCredential.user }, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
      });
      return { data: {}, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      if (!auth.currentUser) {
        return { data: null, error: new Error("Not signed in") };
      }
      await auth.currentUser.updatePassword(newPassword);
      return { data: {}, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
