import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectShare = Database['public']['Tables']['project_shares']['Row'];

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => Promise<boolean>;
  // Nouvelles fonctions pour la gestion des projets
  getUserProjects: () => Promise<Project[]>;
  getSharedProjects: () => Promise<Project[]>;
  getProjectShares: (projectId: string) => Promise<ProjectShare[]>;
  shareProject: (projectId: string, userId: string, permission: 'read' | 'write' | 'admin') => Promise<void>;
  removeProjectShare: (shareId: string) => Promise<void>;
  updateProjectShare: (shareId: string, permission: 'read' | 'write' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageInitialized, setStorageInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Attendre que le stockage persistant soit initialisé
        await new Promise(resolve => setTimeout(resolve, 100));
        setStorageInitialized(true);

        // Récupérer la session active au chargement
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Écouter les changements d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!storageInitialized) {
      throw new Error('Le stockage persistant n\'est pas encore initialisé');
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (!storageInitialized) {
      throw new Error('Le stockage persistant n\'est pas encore initialisé');
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!storageInitialized) {
      throw new Error('Le stockage persistant n\'est pas encore initialisé');
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Fonctions pour la gestion des projets
  const getUserProjects = async () => {
    if (!storageInitialized || !user?.id) {
      throw new Error('Le stockage persistant n\'est pas encore initialisé ou l\'utilisateur n\'est pas connecté');
    }
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data;
  };

  const getSharedProjects = async () => {
    if (!storageInitialized || !user?.id) {
      throw new Error('Le stockage persistant n\'est pas encore initialisé ou l\'utilisateur n\'est pas connecté');
    }
    const { data, error } = await supabase
      .from('project_shares')
      .select(`
        *,
        projects:project_id (*)
      `)
      .eq('shared_with', user.id);
    
    if (error) throw error;
    return data.map(share => share.projects);
  };

  const getProjectShares = async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_shares')
      .select('*')
      .eq('project_id', projectId);
    
    if (error) throw error;
    return data;
  };

  const shareProject = async (projectId: string, userId: string, permission: 'read' | 'write' | 'admin') => {
    const { error } = await supabase
      .from('project_shares')
      .insert({
        project_id: projectId,
        shared_with: userId,
        share_type: 'user',
        permission,
        created_by: user?.id
      });
    
    if (error) throw error;
  };

  const removeProjectShare = async (shareId: string) => {
    const { error } = await supabase
      .from('project_shares')
      .delete()
      .eq('id', shareId);
    
    if (error) throw error;
  };

  const updateProjectShare = async (shareId: string, permission: 'read' | 'write' | 'admin') => {
    const { error } = await supabase
      .from('project_shares')
      .update({ permission })
      .eq('id', shareId);
    
    if (error) throw error;
  };

  const isAdmin = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la vérification du rôle admin:', error);
        return false;
      }

      return data?.role === 'admin';
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle admin:', error);
      return false;
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    getUserProjects,
    getSharedProjects,
    getProjectShares,
    shareProject,
    removeProjectShare,
    updateProjectShare,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
} 