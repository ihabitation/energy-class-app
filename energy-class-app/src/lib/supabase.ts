import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

if (!process.env.REACT_APP_SUPABASE_URL) {
  throw new Error('Missing environment variable: REACT_APP_SUPABASE_URL');
}

if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: REACT_APP_SUPABASE_ANON_KEY');
}

// Fonction pour obtenir l'URL de redirection dynamique
export const getRedirectUrl = () => {
  const hostname = window.location.hostname;
  
  // En développement local (localhost)
  if (hostname === 'localhost') {
    return 'http://localhost:3000/auth/callback';
  }
  
  // En développement sur réseau local (adresse IP)
  if (hostname.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
    return `http://${hostname}:3000/auth/callback`;
  }
  
  // En production (domaine dédié)
  return `${window.location.origin}/auth/callback`;
};

export const supabase = createClient<Database>(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
); 