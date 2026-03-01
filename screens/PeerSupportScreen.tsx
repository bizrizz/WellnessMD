import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../components/theme/useColors';
import { ColorPalette } from '../components/theme/colors';
import { Typography } from '../components/theme/typography';
import { samplePosts } from '../store/mockData';
import { useAppStore } from '../store/appStore';
import { isSupabaseConfigured } from '../supabase/client';
import {
  fetchPosts as apiFetchPosts,
  createPost as apiCreatePost,
  toggleLike as apiToggleLike,
  createReport as apiCreateReport,
  fetchComments as apiFetchComments,
  createComment as apiCreateComment,
  CommentRow,
} from '../supabase/api';
import {
  POST_CATEGORIES,
  PostCategory,
  PostCategoryColors,
  CommunityPost,
} from '../store/types';

interface LocalPost extends CommunityPost {
  isLiked: boolean;
  commentsList: string[];
  dbComments: CommentRow[];
}

function toLocal(post: CommunityPost): LocalPost {
  return { ...post, isLiked: false, commentsList: [], dbComments: [] };
}

function CategoryPill({ category, isSelected, onPress }: { category: PostCategory; isSelected: boolean; onPress: () => void }) {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View style={[st.pill, st.pillBase, isSelected && st.pillSelected]}>
        <Text style={[st.pillText, isSelected ? st.pillTextSelected : st.pillTextBase]}>{category}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PostCard({
  post,
  onToggleLike,
  onFlag,
  onMore,
  onReply,
  onPress,
}: {
  post: LocalPost;
  onToggleLike: () => void;
  onFlag: () => void;
  onMore: () => void;
  onReply: () => void;
  onPress: () => void;
}) {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  const categoryColor = PostCategoryColors[post.category] ?? c.accent;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <View style={st.postCard}>
        {post.imageUrl && (
          <View style={[st.postImage, { backgroundColor: `${categoryColor}18` }]}>
            <Ionicons name="image-outline" size={32} color={`${categoryColor}80`} />
          </View>
        )}

        <View style={st.postBody}>
          <Text style={[st.categoryLabel, { color: categoryColor }]}>
            {post.category.toUpperCase()}
          </Text>

          <View style={st.titleRow}>
            <Text style={st.postTitle} numberOfLines={2}>{post.title}</Text>
            <TouchableOpacity onPress={onMore} hitSlop={8}>
              <Ionicons name="ellipsis-horizontal" size={18} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={st.authorRow}>
            {post.isAnonymous ? (
              <MaterialCommunityIcons name="drama-masks" size={12} color={c.textMuted} />
            ) : (
              <Ionicons name="person" size={12} color={c.textMuted} />
            )}
            <Text style={st.authorText}>{post.author}</Text>
            <Text style={st.dot}>·</Text>
            <Text style={st.timeText}>{post.timeAgo}</Text>
          </View>

          <Text style={st.contentPreview} numberOfLines={2}>{post.content}</Text>

          <View style={st.actionsRow}>
            <TouchableOpacity style={st.actionGroup} onPress={onToggleLike} hitSlop={6}>
              <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={15} color={post.isLiked ? c.warm : c.textMuted} />
              <Text style={[st.actionCount, post.isLiked && { color: c.warm }]}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.actionGroup} onPress={onPress} hitSlop={6}>
              <Ionicons name="chatbubble-outline" size={14} color={c.textSecondary} />
              <Text style={st.actionCount}>{post.comments + post.commentsList.length + post.dbComments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onFlag} hitSlop={8}>
              <Ionicons name="flag-outline" size={14} color={c.textMuted} />
            </TouchableOpacity>
            <View style={st.actionSpacer} />
            <TouchableOpacity style={st.commentButton} onPress={onReply}>
              <Text style={st.commentButtonText}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function PostDetailModal({
  post,
  visible,
  onClose,
  onToggleLike,
  onAddComment,
  onLoadComments,
}: {
  post: LocalPost | null;
  visible: boolean;
  onClose: () => void;
  onToggleLike: () => void;
  onAddComment: (text: string) => void;
  onLoadComments: () => void;
}) {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  const [commentText, setCommentText] = useState('');
  const currentUser = useAppStore((s) => s.currentUser);
  const inputRef = useRef<TextInput>(null);

  if (!post) return null;

  const categoryColor = PostCategoryColors[post.category] ?? c.accent;
  const totalComments = post.comments + post.commentsList.length + post.dbComments.length;

  const handleSend = () => {
    const trimmed = commentText.trim();
    if (trimmed.length === 0) return;
    onAddComment(trimmed);
    setCommentText('');
  };

  useEffect(() => {
    if (visible && post) onLoadComments();
  }, [visible, post?.id]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={st.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={st.detailContainer} edges={['top']}>
          {/* Header */}
          <View style={st.detailHeader}>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color={c.textSecondary} />
            </TouchableOpacity>
            <Text style={st.detailHeaderTitle}>Post</Text>
            <View style={{ width: 22 }} />
          </View>

          <ScrollView contentContainerStyle={st.detailScroll} showsVerticalScrollIndicator={false}>
            {/* Category + author */}
            <Text style={[st.categoryLabel, { color: categoryColor }]}>{post.category.toUpperCase()}</Text>
            <Text style={st.detailTitle}>{post.title}</Text>
            <View style={st.authorRow}>
              {post.isAnonymous ? (
                <MaterialCommunityIcons name="drama-masks" size={13} color={c.textMuted} />
              ) : (
                <Ionicons name="person" size={13} color={c.textMuted} />
              )}
              <Text style={st.authorText}>{post.author}</Text>
              <Text style={st.dot}>·</Text>
              <Text style={st.timeText}>{post.timeAgo}</Text>
            </View>

            {/* Full content */}
            <Text style={st.detailContent}>{post.content}</Text>

            {/* Actions */}
            <View style={st.detailActions}>
              <TouchableOpacity style={st.actionGroup} onPress={onToggleLike}>
                <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={18} color={post.isLiked ? c.warm : c.textMuted} />
                <Text style={[st.actionCount, post.isLiked && { color: c.warm }]}>{post.likes}</Text>
              </TouchableOpacity>
              <View style={st.actionGroup}>
                <Ionicons name="chatbubble-outline" size={16} color={c.textSecondary} />
                <Text style={st.actionCount}>{totalComments}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={st.divider} />

            {/* Comments */}
            <Text style={st.commentsHeader}>{totalComments} {totalComments === 1 ? 'comment' : 'comments'}</Text>

            {post.dbComments.map((cm) => (
              <View key={cm.id} style={st.commentCard}>
                <View style={st.commentAvatar}>
                  <Text style={st.commentAvatarText}>{cm.author_alias.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={st.commentBody}>
                  <Text style={st.commentAuthor}>{cm.author_alias}</Text>
                  <Text style={st.commentContent}>{cm.content}</Text>
                </View>
              </View>
            ))}

            {post.commentsList.map((txt, i) => (
              <View key={`local-${i}`} style={st.commentCard}>
                <View style={st.commentAvatar}>
                  <Text style={st.commentAvatarText}>{(currentUser?.name ?? 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={st.commentBody}>
                  <Text style={st.commentAuthor}>{currentUser?.name ?? 'You'}</Text>
                  <Text style={st.commentContent}>{txt}</Text>
                </View>
              </View>
            ))}

            <View style={{ height: 80 }} />
          </ScrollView>

          {/* Comment input */}
          <View style={st.commentInputBar}>
            <TextInput
              ref={inputRef}
              style={st.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={c.textMuted}
              value={commentText}
              onChangeText={setCommentText}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} disabled={commentText.trim().length === 0} style={{ opacity: commentText.trim().length > 0 ? 1 : 0.3 }}>
              <Ionicons name="send" size={20} color={c.accent} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function NewPostModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (post: { title: string; content: string; category: PostCategory; isAnonymous: boolean }) => void;
}) {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('Residency Life');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), content: content.trim(), category: selectedCategory, isAnonymous });
    setTitle('');
    setContent('');
    setSelectedCategory('Residency Life');
    setIsAnonymous(true);
  };

  const categoriesWithoutAll = POST_CATEGORIES.filter((c) => c !== 'All');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={st.modalContainer}>
        <SafeAreaView style={st.flex}>
          <View style={st.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={st.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={st.modalTitle}>New Post</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView contentContainerStyle={st.modalContent} keyboardShouldPersistTaps="handled">
            <View style={st.toggleRow}>
              <View style={st.toggleLabel}>
                {isAnonymous ? (
                  <MaterialCommunityIcons name="drama-masks" size={18} color={c.textPrimary} />
                ) : (
                  <Ionicons name="person" size={18} color={c.textPrimary} />
                )}
                <Text style={st.toggleText}>{isAnonymous ? 'Post anonymously' : 'Show my name'}</Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: c.cardBorder, true: c.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={st.fieldGroup}>
              <Text style={st.fieldLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={st.pillRow}>
                  {categoriesWithoutAll.map((cat) => (
                    <CategoryPill key={cat} category={cat} isSelected={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={st.fieldGroup}>
              <Text style={st.fieldLabel}>Title</Text>
              <TextInput style={st.textInput} placeholder="What's on your mind?" placeholderTextColor={c.textMuted} value={title} onChangeText={setTitle} />
            </View>

            <View style={st.fieldGroup}>
              <Text style={st.fieldLabel}>Share your thoughts</Text>
              <TextInput
                style={[st.textInput, st.textArea]}
                placeholder="Write something..."
                placeholderTextColor={c.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={[st.submitButton, !canSubmit && st.submitButtonDisabled]} onPress={handleSubmit} disabled={!canSubmit}>
              <Text style={st.submitButtonText}>Post to Community</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function PeerSupportScreen() {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  const currentUser = useAppStore((s) => s.currentUser);
  const userId = currentUser?.id ?? null;
  const isReal = isSupabaseConfigured && userId && !userId.startsWith('local-');

  const [posts, setPosts] = useState<LocalPost[]>(() => samplePosts.map(toLocal));
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('All');
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [detailPostId, setDetailPostId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (!isReal) return;
    setLoading(true);
    const { posts: dbPosts } = await apiFetchPosts(userId);
    if (dbPosts.length > 0) {
      setPosts(
        dbPosts.map((p) => ({
          id: p.id,
          category: (POST_CATEGORIES.includes(p.category as PostCategory) ? p.category : 'Residency Life') as PostCategory,
          title: p.title,
          author: p.author_alias,
          isAnonymous: p.is_anonymous,
          timeAgo: timeAgo(p.created_at),
          content: p.content,
          likes: p.like_count,
          comments: p.comment_count,
          isLiked: p.is_liked,
          commentsList: [],
          dbComments: [],
        })),
      );
    }
    setLoading(false);
  }, [isReal, userId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    let result = selectedCategory === 'All' ? posts : posts.filter((p) => p.category === selectedCategory);
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    return result;
  }, [selectedCategory, posts, searchQuery]);

  const detailPost = useMemo(() => (detailPostId ? posts.find((p) => p.id === detailPostId) ?? null : null), [detailPostId, posts]);

  const toggleLike = useCallback((id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const nowLiked = !post.isLiked;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, isLiked: nowLiked, likes: nowLiked ? p.likes + 1 : p.likes - 1 };
      }),
    );
    if (isReal) apiToggleLike(id, userId!, post.isLiked);
  }, [posts, isReal, userId]);

  const loadComments = useCallback(async (postId: string) => {
    if (!isReal) return;
    const { comments } = await apiFetchComments(postId);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, dbComments: comments } : p)),
    );
  }, [isReal]);

  const addComment = useCallback((id: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, commentsList: [...p.commentsList, text] };
      }),
    );
    if (isReal) {
      apiCreateComment(id, userId!, text, true).then(() => loadComments(id));
    }
  }, [isReal, userId, loadComments]);

  const handleFlag = useCallback((id: string) => {
    Alert.alert('Report Post', 'Are you sure you want to report this post to moderators?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => {
          if (isReal) apiCreateReport(id, userId!, 'Inappropriate content');
          Alert.alert('Reported', 'Thank you. A moderator will review this post.');
        },
      },
    ]);
  }, [isReal, userId]);

  const handleMore = useCallback((id: string) => {
    Alert.alert('Post Options', undefined, [
      { text: 'Report', style: 'destructive', onPress: () => handleFlag(id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleFlag]);

  const handleNewPost = useCallback(
    async (data: { title: string; content: string; category: PostCategory; isAnonymous: boolean }) => {
      if (isReal) {
        await apiCreatePost(userId!, data.title, data.content, data.category, data.isAnonymous);
        setShowNewPost(false);
        loadPosts();
        return;
      }
      const newPost: LocalPost = {
        id: `p-${Date.now()}`,
        category: data.category,
        title: data.title,
        author: data.isAnonymous ? 'Anonymous Resident' : (currentUser?.name ?? 'You'),
        isAnonymous: data.isAnonymous,
        timeAgo: 'Just now',
        content: data.content,
        likes: 0,
        comments: 0,
        isLiked: false,
        commentsList: [],
        dbComments: [],
      };
      setPosts((prev) => [newPost, ...prev]);
      setShowNewPost(false);
    },
    [currentUser?.name, isReal, userId, loadPosts],
  );

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      {/* Header — same vibe as home/resources */}
      <View style={st.header}>
        <View style={{ width: 22 }} />
        <View style={st.headerCenter}>
          <Text style={st.headerTitle}>Community</Text>
          <Text style={st.headerSubtitle}>Connect with peers</Text>
        </View>
        <TouchableOpacity onPress={() => setShowSearch((v) => !v)} hitSlop={8}>
          <Ionicons name={showSearch ? 'close' : 'search'} size={20} color={c.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      {showSearch && (
        <View style={st.searchBar}>
          <Ionicons name="search" size={16} color={c.textMuted} />
          <TextInput
            style={st.searchInput}
            placeholder="Search posts..."
            placeholderTextColor={c.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={c.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Pills + Posts in one scroll */}
      <ScrollView contentContainerStyle={st.mainScroll} showsVerticalScrollIndicator={false}>
        <View style={st.pillWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.pillContainer}>
            {POST_CATEGORIES.map((cat) => (
              <CategoryPill key={cat} category={cat} isSelected={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
            ))}
          </ScrollView>
        </View>

        <View style={st.postsWrapper}>
        {loading && (
          <View style={st.emptyState}>
            <ActivityIndicator size="small" color={c.accent} />
          </View>
        )}
        {!loading && filteredPosts.length === 0 && (
          <View style={st.emptyState}>
            <Ionicons name="chatbubbles-outline" size={36} color={c.textMuted} />
            <Text style={st.emptyText}>{searchQuery.length > 0 ? 'No posts match your search.' : 'No posts yet. Be the first!'}</Text>
          </View>
        )}
          {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onToggleLike={() => toggleLike(post.id)}
            onFlag={() => handleFlag(post.id)}
            onMore={() => handleMore(post.id)}
            onReply={() => setDetailPostId(post.id)}
            onPress={() => setDetailPostId(post.id)}
          />
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={st.fab} onPress={() => setShowNewPost(true)}>
        <Ionicons name="add" size={24} color={c.cardDarkText} />
      </TouchableOpacity>

      <NewPostModal visible={showNewPost} onClose={() => setShowNewPost(false)} onSubmit={handleNewPost} />

      <PostDetailModal
        post={detailPost}
        visible={detailPostId !== null}
        onClose={() => setDetailPostId(null)}
        onToggleLike={() => { if (detailPostId) toggleLike(detailPostId); }}
        onAddComment={(text) => { if (detailPostId) addComment(detailPostId, text); }}
        onLoadComments={() => { if (detailPostId) loadComments(detailPostId); }}
      />
    </SafeAreaView>
  );
}

function makeStyles(c: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    flex: { flex: 1 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 8,
    },
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 32, fontWeight: '400', fontFamily: 'Playfair Display', color: c.textPrimary },
    headerSubtitle: { ...Typography.body, fontSize: 15, color: c.textSecondary, marginTop: 6, fontFamily: 'Lato' },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 24,
      marginBottom: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: c.cardBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
      gap: 8,
    },
    searchInput: { flex: 1, ...Typography.body, color: c.textPrimary, padding: 0 },

    mainScroll: { paddingBottom: 24 },
    pillWrap: { marginTop: 4, minHeight: 50 },
    pillContainer: { paddingHorizontal: 24, paddingVertical: 12, paddingRight: 48, gap: 10, alignItems: 'center' as const },
    pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexShrink: 0 },
    pillBase: { backgroundColor: c.cardBackground, borderWidth: 1, borderColor: c.cardBorder },
    pillSelected: { backgroundColor: c.accent, borderColor: c.accent },
    pillText: { ...Typography.caption, fontFamily: 'Lato' },
    pillTextBase: { color: c.textSecondary },
    pillTextSelected: { color: c.cardDarkText },
    pillRow: { flexDirection: 'row', gap: 8 },

    postsWrapper: { paddingHorizontal: 24, paddingTop: 4, gap: 16 },

    emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { ...Typography.body, color: c.textMuted, textAlign: 'center' },

    postCard: { backgroundColor: c.cardBackground, borderRadius: 20, borderWidth: 1, borderColor: c.cardBorder, overflow: 'hidden' },
    postImage: { height: 110, justifyContent: 'center', alignItems: 'center' },
    postBody: { padding: 20, gap: 10 },
    categoryLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, fontFamily: 'Lato' },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    postTitle: { fontSize: 17, fontWeight: '600', fontFamily: 'Lato', color: c.textPrimary, flex: 1 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    authorText: { ...Typography.small, color: c.textSecondary, fontFamily: 'Lato' },
    dot: { color: c.textMuted },
    timeText: { ...Typography.small, color: c.textMuted },
    contentPreview: { ...Typography.body, fontFamily: 'Lato', color: c.textSecondary, lineHeight: 22 },
    actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 2 },
    actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    actionCount: { ...Typography.small, color: c.textMuted, fontFamily: 'Lato' },
    actionSpacer: { flex: 1 },
    commentButton: { backgroundColor: c.cardPeach, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
    commentButtonText: { ...Typography.small, color: c.accent, fontWeight: '600', fontFamily: 'Lato' },

    fab: {
      position: 'absolute',
      bottom: 100,
      right: 24,
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: c.cardDark,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },

    // New Post Modal
    modalContainer: { flex: 1, backgroundColor: c.background },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
    cancelText: { ...Typography.body, color: c.accent },
    modalTitle: { fontSize: 18, fontWeight: '600', fontFamily: 'Lato', color: c.textPrimary },
    modalContent: { padding: 24, gap: 20 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    toggleLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    toggleText: { ...Typography.body, color: c.textPrimary },
    fieldGroup: { gap: 8 },
    fieldLabel: { ...Typography.caption, color: c.textMuted, fontFamily: 'Lato' },
    textInput: { ...Typography.body, color: c.textPrimary, padding: 14, backgroundColor: c.cardBackground, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder },
    textArea: { height: 150, textAlignVertical: 'top', paddingTop: 12 },
    submitButton: { backgroundColor: c.cardDark, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
    submitButtonDisabled: { backgroundColor: c.cardBorder },
    submitButtonText: { ...Typography.subheadline, fontFamily: 'Lato', color: c.cardDarkText, fontWeight: '600' },

    // Post Detail Modal
    detailContainer: { flex: 1, backgroundColor: c.background },
    detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
    detailHeaderTitle: { fontSize: 18, fontWeight: '600', fontFamily: 'Lato', color: c.textPrimary },
    detailScroll: { paddingHorizontal: 24, paddingTop: 8 },
    detailTitle: { fontSize: 20, fontWeight: '600', fontFamily: 'Lato', color: c.textPrimary, marginTop: 6, marginBottom: 8 },
    detailContent: { ...Typography.body, fontFamily: 'Lato', color: c.textSecondary, lineHeight: 22, marginTop: 12 },
    detailActions: { flexDirection: 'row', gap: 24, marginTop: 20, paddingVertical: 12 },
    divider: { height: 1, backgroundColor: c.cardBorder, marginVertical: 4 },
    commentsHeader: { ...Typography.caption, color: c.textMuted, marginTop: 12, marginBottom: 8 },

    commentCard: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    commentAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.cardDark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    commentAvatarText: { fontSize: 12, fontWeight: '600', color: c.cardDarkText, fontFamily: 'Lato' },
    commentBody: { flex: 1, gap: 2 },
    commentAuthor: { ...Typography.caption, color: c.textPrimary },
    commentContent: { ...Typography.body, color: c.textSecondary },
    placeholderComments: { ...Typography.small, color: c.textMuted, fontStyle: 'italic', marginBottom: 12 },

    commentInputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: c.cardBorder,
      gap: 10,
    },
    commentInput: { flex: 1, ...Typography.body, color: c.textPrimary, backgroundColor: c.cardBackground, borderRadius: 14, borderWidth: 1, borderColor: c.cardBorder, paddingHorizontal: 14, paddingVertical: 10 },
  });
}
