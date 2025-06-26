import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          tokens: number;
          subscription_type: 'free' | 'monthly' | 'yearly';
          subscription_expires_at: string | null;
          last_daily_token_claim: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          tokens?: number;
          subscription_type?: 'free' | 'monthly' | 'yearly';
          subscription_expires_at?: string | null;
          last_daily_token_claim?: string | null;
        };
        Update: {
          full_name?: string;
          tokens?: number;
          subscription_type?: 'free' | 'monthly' | 'yearly';
          subscription_expires_at?: string | null;
          last_daily_token_claim?: string | null;
        };
      };
      saved_content: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          content_type: string;
          platform: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          content: string;
          content_type: string;
          platform: string;
        };
        Update: {
          title?: string;
          content?: string;
        };
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          tokens: number;
          max_uses: number;
          current_uses: number;
          expires_at: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          code: string;
          tokens: number;
          max_uses: number;
          expires_at?: string | null;
          active?: boolean;
        };
        Update: {
          tokens?: number;
          max_uses?: number;
          current_uses?: number;
          expires_at?: string | null;
          active?: boolean;
        };
      };
    };
  };
};