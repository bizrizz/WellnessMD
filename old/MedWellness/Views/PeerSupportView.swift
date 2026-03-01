import SwiftUI

struct PeerSupportView: View {
    @Environment(\.dismiss) var dismiss
    @State private var selectedCategory: PostCategory = .all
    @State private var showNewPostSheet = false
    @State private var searchText = ""
    
    var filteredPosts: [CommunityPost] {
        if selectedCategory == .all {
            return samplePosts
        }
        return samplePosts.filter { $0.category == selectedCategory }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appSosBackground
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Category Pills
                    categoryPills
                        .padding(.top, 8)
                    
                    // Posts Feed
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(filteredPosts) { post in
                                PostCard(post: post)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 16)
                        .padding(.bottom, 100)
                    }
                }
                
                // FAB
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Button(action: { showNewPostSheet = true }) {
                            Image(systemName: "plus")
                                .font(.system(size: 24, weight: .medium))
                                .foregroundColor(.white)
                                .frame(width: 56, height: 56)
                                .background(Color.appSosBlue)
                                .clipShape(Circle())
                                .shadow(color: Color.appSosBlue.opacity(0.4), radius: 10, y: 5)
                        }
                        .padding(.trailing, 20)
                        .padding(.bottom, 100)
                    }
                }
            }
            .navigationTitle("Peer Support")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    VStack(spacing: 2) {
                        Text("Peer Support")
                            .font(.appSubheadline)
                            .foregroundColor(.white)
                        
                        Text("MODERATED COMMUNITY")
                            .font(.system(size: 10))
                            .foregroundColor(.appSosBlue)
                            .tracking(1)
                    }
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.white)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.appTextSecondary)
                    }
                }
            }
        }
        .sheet(isPresented: $showNewPostSheet) {
            NewPostSheet()
        }
    }
    
    private var categoryPills: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(PostCategory.allCases, id: \.self) { category in
                    CategoryPill(
                        category: category,
                        isSelected: selectedCategory == category
                    )
                    .onTapGesture {
                        withAnimation {
                            selectedCategory = category
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }
}

struct CategoryPill: View {
    let category: PostCategory
    let isSelected: Bool
    
    var body: some View {
        Text(category.rawValue)
            .font(.appCaption)
            .foregroundColor(isSelected ? .white : .appTextSecondary)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(isSelected ? Color.appSosBlue : Color.appCommunityCard)
            .clipShape(Capsule())
    }
}

struct PostCard: View {
    let post: CommunityPost
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image header if available
            if post.imageUrl != nil {
                LinearGradient(
                    colors: [Color(hex: post.category.color).opacity(0.3), Color.appCommunityCard],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: 120)
                .overlay(
                    Image(systemName: "photo")
                        .font(.system(size: 40))
                        .foregroundColor(.white.opacity(0.3))
                )
            }
            
            VStack(alignment: .leading, spacing: 12) {
                // Category label
                Text(post.category.rawValue.uppercased())
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(Color(hex: post.category.color))
                    .tracking(1)
                
                HStack {
                    Text(post.title)
                        .font(.appSubheadline)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: {}) {
                        Image(systemName: "ellipsis")
                            .foregroundColor(.appTextMuted)
                    }
                }
                
                // Author info
                HStack(spacing: 6) {
                    if post.isAnonymous {
                        Image(systemName: "theatermasks.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.appTextMuted)
                    } else {
                        Image(systemName: "person.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.appTextMuted)
                    }
                    
                    Text(post.author)
                        .font(.appSmall)
                        .foregroundColor(.appTextSecondary)
                    
                    Text("•")
                        .foregroundColor(.appTextMuted)
                    
                    Text(post.timeAgo)
                        .font(.appSmall)
                        .foregroundColor(.appTextMuted)
                }
                
                // Content preview
                Text(post.content)
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary)
                    .lineLimit(2)
                
                // Actions
                HStack(spacing: 20) {
                    HStack(spacing: 6) {
                        Image(systemName: "heart.fill")
                            .foregroundColor(.appSosBlue)
                        Text("\(post.likes)")
                            .foregroundColor(.appTextSecondary)
                    }
                    .font(.appSmall)
                    
                    HStack(spacing: 6) {
                        Image(systemName: "bubble.left.fill")
                        Text("\(post.comments)")
                    }
                    .font(.appSmall)
                    .foregroundColor(.appTextSecondary)
                    
                    Button(action: {}) {
                        Image(systemName: "flag")
                            .foregroundColor(.appTextMuted)
                    }
                    
                    Spacer()
                    
                    Button(action: {}) {
                        Text("COMMENT")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.appSosBlue)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
            }
            .padding(16)
        }
        .background(Color.appCommunityCard)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

struct NewPostSheet: View {
    @Environment(\.dismiss) var dismiss
    @State private var title = ""
    @State private var content = ""
    @State private var selectedCategory: PostCategory = .residencyLife
    @State private var isAnonymous = true
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appSosBackground
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        // Anonymous toggle
                        Toggle(isOn: $isAnonymous) {
                            HStack(spacing: 10) {
                                Image(systemName: isAnonymous ? "theatermasks.fill" : "person.fill")
                                Text(isAnonymous ? "Post Anonymously" : "Show My Name")
                                    .font(.appBody)
                            }
                            .foregroundColor(.white)
                        }
                        .tint(.appSosBlue)
                        
                        // Category
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Category")
                                .font(.appCaption)
                                .foregroundColor(.appTextMuted)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 10) {
                                    ForEach(PostCategory.allCases.filter { $0 != .all }, id: \.self) { category in
                                        CategoryPill(
                                            category: category,
                                            isSelected: selectedCategory == category
                                        )
                                        .onTapGesture {
                                            selectedCategory = category
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Title
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Title")
                                .font(.appCaption)
                                .foregroundColor(.appTextMuted)
                            
                            TextField("", text: $title, prompt: Text("What's on your mind?").foregroundColor(.appTextMuted))
                                .font(.appSubheadline)
                                .foregroundColor(.white)
                                .padding(16)
                                .background(Color.appCommunityCard)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        
                        // Content
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Share your thoughts")
                                .font(.appCaption)
                                .foregroundColor(.appTextMuted)
                            
                            TextEditor(text: $content)
                                .scrollContentBackground(.hidden)
                                .foregroundColor(.white)
                                .frame(height: 150)
                                .padding(12)
                                .background(Color.appCommunityCard)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        
                        Button(action: submitPost) {
                            Text("Post to Community")
                        }
                        .buttonStyle(AppPrimaryButtonStyle(isEnabled: !title.isEmpty && !content.isEmpty))
                        .disabled(title.isEmpty || content.isEmpty)
                    }
                    .padding(20)
                }
            }
            .navigationTitle("New Post")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.appSosBlue)
                }
            }
        }
    }
    
    private func submitPost() {
        // Submit post
        dismiss()
    }
}

#Preview {
    PeerSupportView()
}
