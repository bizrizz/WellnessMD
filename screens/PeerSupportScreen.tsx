import React, { useState, useMemo, useCallback, useRef } from 'react';
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
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../components/theme/useColors';
import { ColorPalette } from '../components/theme/colors';
import { Typography } from '../components/theme/typography';
import { samplePosts } from '../store/mockData';
import { useAppStore } from '../store/appStore';
import {
  POST_CATEGORIES,
  PostCategory,
  PostCategoryColors,
  CommunityPost,
} from '../store/types';

interface LocalPost extends CommunityPost {
  isLiked: boolean;
  commentsList: string[];
}

function toLocal(post: CommunityPost): LocalPost {
  return { ...post, isLiked: false, commentsList: [] };
}

function CategoryPill({ category, isSelected, onPress }: { category: PostCategory; isSelected: boolean; onPress: () => void }) {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <View style={[st.pill, { backgroundColor: isSelected ? c.accent : c.cardBackground }]}>
        <Text style={[st.pillText, { color: isSelected ? c.background : c.textSecondary }]}>{category}</Text>
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
          <View style={[st.postImage, { backgroundColor: `${categoryColor}12` }]}>
            <Ionicons name="image-outline" size={32} color={`${categoryColor}50`} />
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
              <Text style={st.actionCount}>{post.comments + post.commentsList.length}</Text>
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
}: {
  post: LocalPost | null;
  visible: boolean;
  onClose: () => void;
  onToggleLike: () => void;
  onAddComment: (text: string) => void;
}) {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  const [commentText, setCommentText] = useState('');
  const currentUser = useAppStore((s) => s.currentUser);
  const inputRef = useRef<TextInput>(null);

  if (!post) return null;

  const categoryColor = PostCategoryColors[post.category] ?? c.accent;
  const totalComments = post.comments + post.commentsList.length;

  const handleSend = () => {
    const trimmed = commentText.trim();
    if (trimmed.length === 0) return;
    onAddComment(trimmed);
    setCommentText('');
  };

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

            {post.commentsList.map((c, i) => (
              <View key={i} style={st.commentCard}>
                <View style={st.commentAvatar}>
                  <Text style={st.commentAvatarText}>{(currentUser?.name ?? 'U').charAt(0).toUpperCase()}</Text>
                </View>
                <View style={st.commentBody}>
                  <Text style={st.commentAuthor}>{currentUser?.name ?? 'You'}</Text>
                  <Text style={st.commentContent}>{c}</Text>
                </View>
              </View>
            ))}

            {post.comments > 0 && post.commentsList.length === 0 && (
              <Text style={st.placeholderComments}>Earlier comments are not loaded in this demo.</Text>
            )}

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

export default function PeerSupportScreen() {
  const c = useColors();
  const st = React.useMemo(() => makeStyles(c), [c]);
  const currentUser = useAppStore((s) => s.currentUser);
  const [posts, setPosts] = useState<LocalPost[]>(() => samplePosts.map(toLocal));
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('All');
  const [showNewPost, setShowNewPost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [detailPostId, setDetailPostId] = useState<string | null>(null);

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
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const nowLiked = !p.isLiked;
        return { ...p, isLiked: nowLiked, likes: nowLiked ? p.likes + 1 : p.likes - 1 };
      }),
    );
  }, []);

  const addComment = useCallback((id: string, text: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, commentsList: [...p.commentsList, text] };
      }),
    );
  }, []);

  const handleFlag = useCallback((id: string) => {
    Alert.alert('Report Post', 'Are you sure you want to report this post to moderators?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Reported', 'Thank you. A moderator will review this post.') },
    ]);
  }, []);

  const handleMore = useCallback((id: string) => {
    Alert.alert('Post Options', undefined, [
      { text: 'Report', style: 'destructive', onPress: () => handleFlag(id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [handleFlag]);

  const handleNewPost = useCallback(
    (data: { title: string; content: string; category: PostCategory; isAnonymous: boolean }) => {
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
      };
      setPosts((prev) => [newPost, ...prev]);
      setShowNewPost(false);
    },
    [currentUser?.name],
  );

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      {/* Header */}
      <View style={st.header}>
        <View style={{ width: 22 }} />
        <View style={st.headerCenter}>
          <Text style={st.headerTitle}>Community</Text>
          <Text style={st.headerSubtitle}>MODERATED FORUM</Text>
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

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.pillScroll} contentContainerStyle={st.pillContainer}>
        {POST_CATEGORIES.map((cat) => (
          <CategoryPill key={cat} category={cat} isSelected={selectedCategory === cat} onPress={() => setSelectedCategory(cat)} />
        ))}
      </ScrollView>

      {/* Posts */}
      <ScrollView contentContainerStyle={st.postsContainer} showsVerticalScrollIndicator={false}>
        {filteredPosts.length === 0 && (
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
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={st.fab} onPress={() => setShowNewPost(true)}>
        <Ionicons name="add" size={24} color={c.background} />
      </TouchableOpacity>

      <NewPostModal visible={showNewPost} onClose={() => setShowNewPost(false)} onSubmit={handleNewPost} />

      <PostDetailModal
        post={detailPost}
        visible={detailPostId !== null}
        onClose={() => setDetailPostId(null)}
        onToggleLike={() => { if (detailPostId) toggleLike(detailPostId); }}
        onAddComment={(text) => { if (detailPostId) addComment(detailPostId, text); }}
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
      paddingVertical: 12,
    },
    headerCenter: { alignItems: 'center' },
    headerTitle: { ...Typography.subheadline, color: c.textPrimary },
    headerSubtitle: { fontSize: 10, fontWeight: '500', color: c.textMuted, letterSpacing: 1, marginTop: 2 },

    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 24,
      marginBottom: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: c.cardBackground,
      borderRadius: 10,
      gap: 8,
    },
    searchInput: { flex: 1, ...Typography.body, color: c.textPrimary, padding: 0 },

    pillScroll: { minHeight: 44, maxHeight: 44 },
    pillContainer: { paddingHorizontal: 24, paddingVertical: 4, gap: 8, alignItems: 'center' as const },
    pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    pillText: { ...Typography.caption },
    pillRow: { flexDirection: 'row', gap: 8 },

    postsContainer: { padding: 24, gap: 16 },

    emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { ...Typography.body, color: c.textMuted, textAlign: 'center' },

    postCard: { backgroundColor: c.cardBackground, borderRadius: 14, overflow: 'hidden' },
    postImage: { height: 110, justifyContent: 'center', alignItems: 'center' },
    postBody: { padding: 16, gap: 10 },
    categoryLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    postTitle: { ...Typography.subheadline, color: c.textPrimary, flex: 1 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    authorText: { ...Typography.small, color: c.textSecondary },
    dot: { color: c.textMuted },
    timeText: { ...Typography.small, color: c.textMuted },
    contentPreview: { ...Typography.body, color: c.textSecondary },
    actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 2 },
    actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    actionCount: { ...Typography.small, color: c.textMuted },
    actionSpacer: { flex: 1 },
    commentButton: { backgroundColor: c.accentGlow, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
    commentButtonText: { ...Typography.small, color: c.accent, fontWeight: '600' },

    fab: {
      position: 'absolute',
      bottom: 100,
      right: 24,
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: c.accent,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },

    // New Post Modal
    modalContainer: { flex: 1, backgroundColor: c.background },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
    cancelText: { ...Typography.body, color: c.accent },
    modalTitle: { ...Typography.subheadline, color: c.textPrimary },
    modalContent: { padding: 24, gap: 20 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    toggleLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    toggleText: { ...Typography.body, color: c.textPrimary },
    fieldGroup: { gap: 8 },
    fieldLabel: { ...Typography.caption, color: c.textMuted },
    textInput: { ...Typography.body, color: c.textPrimary, padding: 14, backgroundColor: c.cardBackground, borderRadius: 10 },
    textArea: { height: 150, textAlignVertical: 'top', paddingTop: 12 },
    submitButton: { backgroundColor: c.accent, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    submitButtonDisabled: { backgroundColor: c.cardBorder },
    submitButtonText: { ...Typography.subheadline, color: c.background, fontWeight: '600' },

    // Post Detail Modal
    detailContainer: { flex: 1, backgroundColor: c.background },
    detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
    detailHeaderTitle: { ...Typography.subheadline, color: c.textPrimary },
    detailScroll: { paddingHorizontal: 24, paddingTop: 8 },
    detailTitle: { ...Typography.headline, color: c.textPrimary, marginTop: 6, marginBottom: 8 },
    detailContent: { ...Typography.body, color: c.textSecondary, lineHeight: 22, marginTop: 12 },
    detailActions: { flexDirection: 'row', gap: 24, marginTop: 20, paddingVertical: 12 },
    divider: { height: 1, backgroundColor: c.cardBorder, marginVertical: 4 },
    commentsHeader: { ...Typography.caption, color: c.textMuted, marginTop: 12, marginBottom: 8 },

    commentCard: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    commentAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    commentAvatarText: { fontSize: 12, fontWeight: '600', color: c.background },
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
    commentInput: { flex: 1, ...Typography.body, color: c.textPrimary, backgroundColor: c.cardBackground, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  });
}
