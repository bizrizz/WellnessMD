import { supabase, isSupabaseConfigured } from './client';
import type { MoodValue } from '../store/types';

// ===== PROFILES =====

export async function fetchProfile(userId: string) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

/** Update avatar_url; uses upsert so profile is created if missing (e.g. user signed up before trigger). */
export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, avatar_url: avatarUrl }, { onConflict: 'id' })
    .select()
    .single();
  return { data, error };
}

const BUCKET_MISSING_MESSAGE =
  'Create an "avatars" bucket: Supabase Dashboard → Storage → New bucket → name "avatars" → Public → Create.';

/** Decode base64 to ArrayBuffer (avoids fetch(file://) which fails in React Native). */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/** Upload avatar to Supabase Storage. Use base64 for reliability on React Native (file:// fetch fails). */
export async function uploadAvatar(
  userId: string,
  source: { uri: string } | { base64: string },
): Promise<{ url: string | null; error: unknown }> {
  if (!isSupabaseConfigured) return { url: null, error: null };
  const path = `${userId}/avatar.jpg`;

  await supabase.storage.createBucket('avatars', { public: true }).catch(() => {});

  try {
    let body: ArrayBuffer | Blob;
    if ('base64' in source && source.base64) {
      body = base64ToArrayBuffer(source.base64);
    } else {
      const response = await fetch(source.uri);
      body = await response.blob();
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, body, { upsert: true, contentType: 'image/jpeg' });

    if (uploadError) {
      const msg = String(uploadError.message || '').toLowerCase();
      if (msg.includes('bucket') || msg.includes('not found') || msg.includes('does not exist')) {
        return { url: null, error: new Error(BUCKET_MISSING_MESSAGE) };
      }
      return { url: null, error: uploadError };
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
    const url = urlData?.publicUrl ?? null;
    // Append cache-bust so re-uploads display immediately
    return { url: url ? `${url}?t=${Date.now()}` : null, error: null };
  } catch (e) {
    return { url: null, error: e };
  }
}

// ===== POSTS =====

export interface PostRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  is_anonymous: boolean;
  is_flagged: boolean;
  created_at: string;
  author_alias: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export async function fetchPosts(currentUserId: string | null): Promise<{ posts: PostRow[]; error: unknown }> {
  if (!isSupabaseConfigured) return { posts: [], error: null };

  const { data: rawPosts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !rawPosts) return { posts: [], error };

  const userIds = [...new Set(rawPosts.map((p: any) => p.user_id))];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, participant_id, full_name')
    .in('id', userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, p]),
  );

  const postIds = rawPosts.map((p: any) => p.id);

  const { data: allLikes } = await supabase
    .from('post_likes')
    .select('post_id, user_id')
    .in('post_id', postIds);

  const { data: allComments } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds);

  const enriched: PostRow[] = rawPosts.map((p: any) => {
    const profile: any = profileMap.get(p.user_id);
    const likeCount = (allLikes ?? []).filter((l: any) => l.post_id === p.id).length;
    const commentCount = (allComments ?? []).filter((c: any) => c.post_id === p.id).length;
    const isLiked = currentUserId
      ? (allLikes ?? []).some((l: any) => l.post_id === p.id && l.user_id === currentUserId)
      : false;

    let authorAlias: string;
    if (p.is_anonymous) {
      authorAlias = profile?.participant_id
        ? `Resident ${profile.participant_id}`
        : 'Anonymous Resident';
    } else {
      authorAlias = profile?.full_name || 'Resident';
    }

    return {
      id: p.id,
      user_id: p.user_id,
      title: p.title,
      content: p.content,
      category: p.category,
      is_anonymous: p.is_anonymous,
      is_flagged: p.is_flagged,
      created_at: p.created_at,
      author_alias: authorAlias,
      like_count: likeCount,
      comment_count: commentCount,
      is_liked: isLiked,
    };
  });

  return { posts: enriched, error: null };
}

export async function createPost(
  userId: string,
  title: string,
  content: string,
  category: string,
  isAnonymous: boolean,
) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, title, content, category, is_anonymous: isAnonymous })
    .select()
    .single();
  return { data, error };
}

export async function deletePost(postId: string) {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  return { error };
}

// ===== LIKES =====

export async function toggleLike(postId: string, userId: string, isCurrentlyLiked: boolean) {
  if (!isSupabaseConfigured) return { error: null };
  if (isCurrentlyLiked) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    return { error };
  } else {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId });
    return { error };
  }
}

// ===== COMMENTS =====

export interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  author_alias: string;
}

export async function fetchComments(postId: string): Promise<{ comments: CommentRow[]; error: unknown }> {
  if (!isSupabaseConfigured) return { comments: [], error: null };

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !data) return { comments: [], error };

  const userIds = [...new Set(data.map((c: any) => c.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, participant_id, full_name')
    .in('id', userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p: any) => [p.id, p]),
  );

  const enriched: CommentRow[] = data.map((c: any) => {
    const profile: any = profileMap.get(c.user_id);
    const isAnon = c.is_anonymous ?? true;
    const authorAlias = isAnon
      ? (profile?.participant_id ? `Resident ${profile.participant_id}` : 'Anonymous')
      : (profile?.full_name || 'Resident');

    return {
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      content: c.content,
      is_anonymous: isAnon,
      created_at: c.created_at,
      author_alias: authorAlias,
    };
  });

  return { comments: enriched, error: null };
}

export async function createComment(
  postId: string,
  userId: string,
  content: string,
  isAnonymous: boolean,
) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: userId, content, is_anonymous: isAnonymous })
    .select()
    .single();
  return { data, error };
}

// ===== REPORTS =====

export async function createReport(postId: string, reporterId: string, reason: string) {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase
    .from('reports')
    .insert({ post_id: postId, reporter_id: reporterId, reason });
  return { error };
}

// ===== ACTIVITY LOGS =====

export async function insertActivityLog(
  userId: string,
  interventionId: string | null,
  durationMinutes: number,
) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data, error } = await supabase
    .from('activity_logs')
    .insert({
      user_id: userId,
      intervention_id: interventionId,
      duration_minutes: durationMinutes,
    })
    .select()
    .single();
  return { data, error };
}

export async function fetchActivityLogs(userId: string) {
  if (!isSupabaseConfigured) return { data: [], error: null };
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });
  return { data: data ?? [], error };
}

// ===== MOOD LOGS =====

export async function logMood(userId: string, mood: MoodValue) {
  if (!isSupabaseConfigured) return { data: null, error: null };
  const { data, error } = await supabase
    .from('mood_logs')
    .insert({ user_id: userId, mood })
    .select()
    .single();
  return { data, error };
}

export async function fetchMoodLogs(userId: string, limit = 100) {
  if (!isSupabaseConfigured) return { data: [], error: null };
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(limit);
  return { data: data ?? [], error };
}

/** Returns most recent mood logged today, or null if none. */
export async function fetchTodaysMood(userId: string): Promise<{ mood: MoodValue | null; error: unknown }> {
  if (!isSupabaseConfigured) return { mood: null, error: null };
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const { data, error } = await supabase
    .from('mood_logs')
    .select('mood')
    .eq('user_id', userId)
    .gte('logged_at', startOfDay)
    .lt('logged_at', endOfDay)
    .order('logged_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return { mood: null, error };
  return { mood: data.mood as MoodValue, error: null };
}

// ===== PUSH TOKENS =====

export async function savePushToken(userId: string, expoPushToken: string) {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.from('user_push_tokens').upsert(
    { user_id: userId, expo_push_token: expoPushToken },
    { onConflict: 'user_id,expo_push_token' }
  );
  return { error };
}

export async function removePushToken(userId: string, expoPushToken: string) {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase
    .from('user_push_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('expo_push_token', expoPushToken);
  return { error };
}

export async function removeAllPushTokensForUser(userId: string) {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.from('user_push_tokens').delete().eq('user_id', userId);
  return { error };
}

// ===== RESOURCES =====

export async function fetchResources() {
  if (!isSupabaseConfigured) return { data: [], error: null };
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('category');
  return { data: data ?? [], error };
}
