import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Employee, BusinessData } from '@/types/business';
import {
  auth,
  db,
  googleProvider
} from '@/lib/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  employee: Employee | null; // Keeping for compatibility, but mapped from User
  business: BusinessData | null;
  isAuthenticated: boolean;
  isBusinessConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveBusiness: (data: BusinessData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Fetch business where ownerId == currentUser.uid
        try {
          // Check if business exists with this ownerId
          const q = query(
            collection(db, "businesses"),
            where("ownerId", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const businessDoc = querySnapshot.docs[0];
            setBusiness({ id: businessDoc.id, ...businessDoc.data() } as BusinessData);
          } else {
            setBusiness(null);
          }
        } catch (error) {
          console.error("Error fetching business:", error);
          setBusiness(null);
        }
      } else {
        setBusiness(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setBusiness(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const saveBusiness = async (data: BusinessData) => {
    if (!user) return;

    try {
      // Create or update business document
      const businessId = data.id || crypto.randomUUID();
      const businessData = {
        ...data,
        id: businessId,
        ownerId: user.uid,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "businesses", businessId), businessData);
      setBusiness(businessData);
    } catch (error) {
      console.error("Error saving business:", error);
      throw error;
    }
  };

  // Adapter for existing components expecting 'employee'
  const employee: Employee | null = user ? {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || 'User',
    role: 'owner',
    businessId: business?.id || ''
  } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        business,
        isAuthenticated: !!user,
        isBusinessConfigured: !!business,
        loginWithGoogle,
        logout,
        saveBusiness,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
