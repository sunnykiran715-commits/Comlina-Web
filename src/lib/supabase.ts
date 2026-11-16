// client/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

/**
 * Normalizes and sanitizes any user-provided Supabase URL.
 * Automatically adds https://, strips angle brackets/placeholders,
 * and falls back to a valid dummy URL during build/CI so prerendering never crashes.
 */
function resolveSupabaseUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return 'https://placeholder.supabase.co';
  let trimmed = url.trim().replace(/^<+|>+$/g, '');
  if (!trimmed || trimmed === 'placeholder' || trimmed === 'undefined' || trimmed === 'null') {
    return 'https://placeholder.supabase.co';
  }
  if (!trimmed.match(/^https?:\/\//i)) {
    trimmed = `https://${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    if (!parsed.protocol.startsWith('http') || parsed.hostname.includes('<') || parsed.hostname.includes('>')) {
      return 'https://placeholder.supabase.co';
    }
    return trimmed;
  } catch {
    return 'https://placeholder.supabase.co';
  }
}

const supabaseUrl = resolveSupabaseUrl(rawUrl);
const supabaseAnonKey = rawAnonKey.trim() || 'placeholder-anon-key';

/**
 * Returns true when real Supabase Cloud credentials are configured.
 * When false, the app uses backend-only auth (POST /api/auth/signup, /api/auth/login).
 */
export { supabaseUrl, supabaseAnonKey };

export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseUrl.startsWith('https://');

if (!isSupabaseConfigured) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.info(
      '[Comlina] Supabase Cloud is not configured — using backend-only authentication (POST /api/auth/signup, /api/auth/login).'
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
