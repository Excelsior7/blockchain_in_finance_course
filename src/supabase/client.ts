import { createClient } from '@supabase/supabase-js';

// Normalement, ces valeurs devraient être stockées dans des variables d'environnement
// Pour un projet réel, utilisez process.env.REACT_APP_SUPABASE_URL et process.env.REACT_APP_SUPABASE_ANON_KEY
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ""
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables Supabase
export type UserType = {
  id: string;
  username: string;
  wallet_address: string;
  created_at: string;
};

export type CompletedCourseType = {
  id: number;
  user_id: string;
  course_id: number;
  completed_at: string;
  tx_hash: string;
};

// Fonctions d'authentification
export const signUp = async (
  username: string,
  email: string,
  password: string,
  walletAddress: string
) => {
  try {
    // Créer un nouvel utilisateur dans Auth avec les métadonnées
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          wallet_address: walletAddress
        }
      }
    });

    if (authError) throw authError;

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return { success: false, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Récupérer les infos du profil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    if (profileError) throw profileError;

    return { success: true, user: data.user, profile: profileData };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return { success: false, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return { success: false, error };
    }
    return { success: true };
  } catch (error) {
    // Si l'erreur est AuthSessionMissingError, on considère que l'utilisateur est déjà déconnecté
    if (error instanceof Error && error.message.includes('Auth session missing')) {
      console.log('Utilisateur déjà déconnecté');
      return { success: true };
    }
    console.error('Erreur lors de la déconnexion:', error);
    return { success: false, error };
  }
};

// Fonctions pour les cours complétés
export const getCompletedCourses = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('completed_courses')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de la récupération des cours complétés:', error);
    return { success: false, error };
  }
};

export const completeCourse = async (
  userId: string,
  courseId: number,
  txHash: string
) => {
  try {
    const { data, error } = await supabase
      .from('completed_courses')
      .insert([
        {
          user_id: userId,
          course_id: courseId,
          tx_hash: txHash,
          completed_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un cours complété:', error);
    return { success: false, error };
  }
}; 