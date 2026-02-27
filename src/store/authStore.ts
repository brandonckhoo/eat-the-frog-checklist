import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../data/supabaseClient';

interface AuthState {
  user: User | null;
  loading: boolean;
  init: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init() {
    supabase.auth.getSession().then(({ data }) => {
      set({ user: data.session?.user ?? null, loading: false });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false });
    });
  },

  async signOut() {
    await supabase.auth.signOut();
  },
}));
