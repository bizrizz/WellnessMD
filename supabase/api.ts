import { supabase, isSupabaseConfigured } from './client';

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

// ===== RESOURCES =====

export async function fetchResources() {
  if (!isSupabaseConfigured) return { data: [], error: null };
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('category');
  return { data: data ?? [], error };
}
