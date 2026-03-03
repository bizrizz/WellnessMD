import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../supabase/client';

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function requestEmailOtp(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
  return { data, error };
}

export async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'magiclink',
  });
  return { data, error };
}

export async function updateUserProfileMetadata(updates: Record<string, unknown>) {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });
  return { data, error };
}

const DEFAULT_REDIRECT = 'wellnessmd://auth/callback';

/** Get redirect URL for OAuth. Uses EXPO_PUBLIC_AUTH_REDIRECT_URL or default. */
function getRedirectUrl(): string {
  const env = typeof process !== 'undefined' ? process?.env?.EXPO_PUBLIC_AUTH_REDIRECT_URL : undefined;
  return (env as string | undefined) || DEFAULT_REDIRECT;
}

/** Parse tokens from Supabase OAuth callback URL (hash fragment). */
function parseOAuthCallbackUrl(url: string): { access_token?: string; refresh_token?: string } {
  try {
    const hash = url.split('#')[1];
    if (!hash) return {};
    const params = new URLSearchParams(hash);
    return {
      access_token: params.get('access_token') ?? undefined,
      refresh_token: params.get('refresh_token') ?? undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Sign in with Google via OAuth.
 * Opens browser, user signs in, redirects back to app with tokens.
 * Requires: Supabase Google provider enabled, redirect URL in Supabase Dashboard.
 */
export async function signInWithGoogle(): Promise<{ data: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null; error: Error | null }> {
  const redirectTo = getRedirectUrl();

  const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (oauthError) {
    return { data: null, error: oauthError as Error };
  }

  const url = oauthData?.url;
  if (!url) {
    return { data: null, error: new Error('No OAuth URL returned') };
  }

  const result = await WebBrowser.openAuthSessionAsync(url, redirectTo);

  if (result.type !== 'success' || !result.url) {
    return { data: null, error: new Error('Sign in cancelled or failed') };
  }

  const { access_token, refresh_token } = parseOAuthCallbackUrl(result.url);
  if (!access_token || !refresh_token) {
    return { data: null, error: new Error('Could not get session from callback') };
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) {
    return { data: null, error: sessionError as Error };
  }

  return {
    data: {
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email ?? undefined,
        user_metadata: (sessionData.user.user_metadata ?? {}) as Record<string, unknown>,
      },
    },
    error: null,
  };
}
