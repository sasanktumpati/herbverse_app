import { create, StateCreator } from 'zustand';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt?: FirebaseFirestoreTypes.Timestamp;
  isVendor?: boolean; 
}

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  profile: UserProfile | null;
  isVendor: boolean;
  loadingStates: {
    auth: boolean;
    signIn: boolean;
    signUp: boolean;
    signOut: boolean;
    profileUpdate: boolean;
    profileFetch: boolean;
  };
  errors: {
    auth: Error | null;
    signIn: Error | null;
    signUp: Error | null;
    signOut: Error | null;
    profileUpdate: Error | null;
    profileFetch: Error | null;
  };
  initializing: boolean;
  authListener: (() => void) | null;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string, isVendor: boolean) => Promise<void>; // Added isVendor parameter
  signOut: () => Promise<void>;
  setUserAndProfile: (user: FirebaseAuthTypes.User | null, profile?: UserProfile | null) => void;
  fetchUserProfile: (uid: string) => Promise<UserProfile | null>;
  updateUserProfile: (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>) => Promise<void>;
  clearAuthError: (errorType?: keyof AuthState['errors']) => void;
  initializeAuthListener: () => void;
  cleanup: () => void;
}

const authStoreCreator: StateCreator<AuthState> = (set, get) => ({
  user: null,
  profile: null,
  isVendor: false,
  loadingStates: {
    auth: true,
    signIn: false,
    signUp: false,
    signOut: false,
    profileUpdate: false,
    profileFetch: false,
  },
  errors: {
    auth: null,
    signIn: null,
    signUp: null,
    signOut: null,
    profileUpdate: null,
    profileFetch: null,
  },
  initializing: true,
  authListener: null,

  setUserAndProfile: (user, profile = null) => {
    set({ 
      user, 
      profile: user ? profile : null, 
      isVendor: user && profile ? !!profile.isVendor : false, // Use the formalized isVendor field
      initializing: false,
      loadingStates: {
        ...get().loadingStates,
        auth: false
      }
    });
  },

  clearAuthError: (errorType) => {
    if (errorType) {
      set(state => ({
        errors: {
          ...state.errors,
          [errorType]: null
        }
      }));
    } else {
      set({
        errors: {
          auth: null,
          signIn: null,
          signUp: null,
          signOut: null,
          profileUpdate: null,
          profileFetch: null,
        }
      });
    }
  },

  fetchUserProfile: async (uid: string): Promise<UserProfile | null> => {
    set(state => ({
      loadingStates: {
        ...state.loadingStates,
        profileFetch: true
      }
    }));
    
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      
      set(state => ({
        loadingStates: {
          ...state.loadingStates,
          profileFetch: false
        }
      }));
      
      if (userDoc.exists) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (e: any) {
      set(state => ({
        loadingStates: {
          ...state.loadingStates,
          profileFetch: false
        },
        errors: {
          ...state.errors,
          profileFetch: e
        }
      }));
      return null;
    }
  },

  signInWithEmail: async (email: string, pass: string) => {
    set(state => ({
      loadingStates: {
        ...state.loadingStates,
        signIn: true
      },
      errors: {
        ...state.errors,
        signIn: null
      }
    }));
    
    try {
      await auth().signInWithEmailAndPassword(email, pass);
      set(state => ({
        loadingStates: {
          ...state.loadingStates,
          signIn: false
        }
      }));
    } catch (e: any) {
      set(state => ({
        errors: {
          ...state.errors,
          signIn: e
        },
        loadingStates: {
          ...state.loadingStates,
          signIn: false
        }
      }));
    }
  },

  signUpWithEmail: async (email: string, pass: string, displayName: string, isVendor: boolean) => { // Added isVendor parameter
    set(state => ({
      loadingStates: {
        ...state.loadingStates,
        signUp: true
      },
      errors: {
        ...state.errors,
        signUp: null
      }
    }));
    
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, pass);
      if (userCredential.user) {
        await userCredential.user.updateProfile({ displayName });
        const userProfileData: Omit<UserProfile, 'createdAt'> & { createdAt: FirebaseFirestoreTypes.FieldValue } = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName,
          photoURL: userCredential.user.photoURL,
          isVendor: isVendor, // Persist isVendor status
          createdAt: firestore.FieldValue.serverTimestamp(),
        };
        await firestore().collection('users').doc(userCredential.user.uid).set(userProfileData);
      }
      
      set(state => ({
        loadingStates: {
          ...state.loadingStates,
          signUp: false
        }
      }));
    } catch (e: any) {
      set(state => ({
        errors: {
          ...state.errors,
          signUp: e
        },
        loadingStates: {
          ...state.loadingStates,
          signUp: false
        }
      }));
    }
  },

  updateUserProfile: async (uid: string, data: Partial<Omit<UserProfile, 'uid' | 'email' | 'createdAt'>>) => {
    set(state => ({
      loadingStates: {
        ...state.loadingStates,
        profileUpdate: true
      },
      errors: {
        ...state.errors,
        profileUpdate: null
      }
    }));
    
    try {
      const currentProfile = get().profile;
      if (!currentProfile || currentProfile.uid !== uid) {
        throw new Error("User not authenticated or UID mismatch for profile update.");
      }
      const updateData = {
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };
      await firestore().collection('users').doc(uid).update(updateData);
      
      set(state => ({ 
        profile: state.profile ? { ...state.profile, ...updateData, updatedAt: new Date() as any } : null,
        loadingStates: {
          ...state.loadingStates,
          profileUpdate: false
        }
      }));
    } catch (e: any) {
      set(state => ({
        errors: {
          ...state.errors,
          profileUpdate: e
        },
        loadingStates: {
          ...state.loadingStates,
          profileUpdate: false
        }
      }));
    }
  },

  signOut: async () => {
    set(state => ({
      loadingStates: {
        ...state.loadingStates,
        signOut: true
      },
      errors: {
        ...state.errors,
        signOut: null
      }
    }));
    
    try {
      await auth().signOut();
      set({ 
        user: null, 
        profile: null, 
        isVendor: false,
        loadingStates: { 
          ...get().loadingStates, 
          signOut: false, 
          auth: false 
        },
        errors: { 
          ...get().errors, 
          signOut: null 
        }
      });
    } catch (e: any) {
      set(state => ({
        errors: {
          ...state.errors,
          signOut: e
        },
        loadingStates: {
          ...state.loadingStates,
          signOut: false
        }
      }));
    }
  },
  
  initializeAuthListener: () => {
    if (get().authListener) {
      get().authListener();
    }
    
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      const { setUserAndProfile, fetchUserProfile, user: currentUser } = get();
      
      if (currentUser && user?.uid === currentUser.uid) {
        return;
      }

      if (user) {
        const profile = await fetchUserProfile(user.uid);
        setUserAndProfile(user, profile);
      } else {
        setUserAndProfile(null, null);
      }
    });
    
    set({ authListener: unsubscribe });
  },
  
  cleanup: () => {
    if (get().authListener) {
      get().authListener();
      set({ authListener: null });
    }
  }
});

const useAuthStore = create<AuthState>(authStoreCreator);

export default useAuthStore;