import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserType, signIn, signOut, signUp, getCompletedCourses, completeCourse, CompletedCourseType } from '../supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserType | null;
  completedCourses: CompletedCourseType[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<{ success: boolean; error?: any }>;
  register: (username: string, email: string, password: string, walletAddress: string) => Promise<{ success: boolean; error?: any }>;
  completeCourse: (courseId: number, txHash: string) => Promise<{ success: boolean; error?: any }>;
}

// Création du contexte avec des valeurs par défaut
export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  completedCourses: [],
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  register: async () => ({ success: false }),
  completeCourse: async () => ({ success: false }),
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Provider du contexte
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourseType[]>([]);
  const [loading, setLoading] = useState(true);

  // Vérifier la session utilisateur au chargement et s'abonner aux changements d'auth
  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Récupérer le profil
        fetchUserProfile(session.user.id);
        // Récupérer les cours complétés
        fetchCompletedCourses(session.user.id);
      }
      
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Récupérer le profil
        fetchUserProfile(session.user.id);
        // Récupérer les cours complétés
        fetchCompletedCourses(session.user.id);
      } else {
        setProfile(null);
        setCompletedCourses([]);
      }
      
      setLoading(false);
    });

    // Nettoyage à la désinscription
    return () => subscription.unsubscribe();
  }, []);

  // Récupérer le profil utilisateur
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data as UserType);
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
    }
  };

  // Récupérer les cours complétés
  const fetchCompletedCourses = async (userId: string) => {
    const result = await getCompletedCourses(userId);
    if (result.success && result.data) {
      setCompletedCourses(result.data);
    }
  };

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    
    if (result.success && result.profile) {
      setProfile(result.profile as UserType);
      // Récupérer les cours complétés
      if (result.user) {
        fetchCompletedCourses(result.user.id);
      }
    }
    
    return result;
  };

  // Fonction de déconnexion
  const logout = async () => {
    setLoading(true);
    try {
      const result = await signOut();
      // Réinitialiser l'état local, même en cas d'erreur
      setProfile(null);
      setCompletedCourses([]);
      setSession(null);
      setUser(null);
      
      return result;
    } catch (error) {
      console.error('Erreur dans la déconnexion AuthContext:', error);
      // Réinitialiser l'état local même en cas d'erreur
      setProfile(null);
      setCompletedCourses([]);
      setSession(null);
      setUser(null);
      return { success: true, error };
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (username: string, email: string, password: string, walletAddress: string) => {
    setLoading(true);
    const result = await signUp(username, email, password, walletAddress);
    setLoading(false);
    return result;
  };

  // Fonction pour marquer un cours comme complété
  const handleCompleteCourse = async (courseId: number, txHash: string) => {
    if (!user) return { success: false, error: 'Non authentifié' };
    
    setLoading(true);
    const result = await completeCourse(user.id, courseId, txHash);
    setLoading(false);
    
    if (result.success && result.data) {
      // Mettre à jour la liste des cours complétés avec le nouvel objet
      setCompletedCourses(prev => [...prev, result.data[0]]);
    }
    
    return result;
  };

  const value = {
    session,
    user,
    profile,
    completedCourses,
    loading,
    login,
    logout,
    register,
    completeCourse: handleCompleteCourse,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 