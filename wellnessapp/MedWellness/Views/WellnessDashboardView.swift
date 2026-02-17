import SwiftUI

struct WellnessDashboardView: View {
    @EnvironmentObject var appState: AppState
    @State private var showSOSSheet = false
    @State private var showCommunitySheet = false
    @State private var selectedActivity: WellnessActivity?
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        headerView
                        
                        // Daily Wellness Score
                        wellnessScoreCard
                        
                        // Quick Actions
                        quickActionsRow
                        
                        // For You Section
                        forYouSection
                        
                        // Weekly Snapshot
                        weeklySnapshotCard
                        
                        Spacer(minLength: 100)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                }
            }
            .fullScreenCover(isPresented: $showSOSSheet) {
                QuickReliefView()
            }
            .fullScreenCover(isPresented: $showCommunitySheet) {
                PeerSupportView()
            }
            .sheet(item: $selectedActivity) { activity in
                ActivityGuideView(activity: activity)
            }
        }
    }
    
    private var headerView: some View {
        HStack(spacing: 16) {
            // Profile Image
            ZStack {
                Circle()
                    .fill(LinearGradient(colors: [.appAccent, .appAccentSecondary], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 50, height: 50)
                
                Image(systemName: "person.fill")
                    .font(.system(size: 24))
                    .foregroundColor(.white)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text("WELCOME BACK")
                    .font(.appSmall)
                    .foregroundColor(.appAccent)
                    .tracking(1.2)
                
                Text(appState.currentUser?.name ?? "Dr. Smith")
                    .font(.appHeadline)
                    .foregroundColor(.white)
            }
            
            Spacer()
            
            // Notification Bell
            Button(action: {}) {
                ZStack {
                    Circle()
                        .fill(Color.appAccent)
                        .frame(width: 44, height: 44)
                    
                    Image(systemName: "bell.fill")
                        .foregroundColor(.black)
                }
            }
        }
    }
    
    private var wellnessScoreCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("DAILY WELLNESS SCORE")
                .font(.appSmall)
                .foregroundColor(.appTextMuted)
                .tracking(1.2)
            
            HStack(spacing: 20) {
                // Circular Progress
                ZStack {
                    Circle()
                        .stroke(Color.appCardBorder, lineWidth: 8)
                        .frame(width: 100, height: 100)
                    
                    Circle()
                        .trim(from: 0, to: CGFloat(appState.currentUser?.wellnessScore ?? 82) / 100)
                        .stroke(
                            Color.appAccent,
                            style: StrokeStyle(lineWidth: 8, lineCap: .round)
                        )
                        .frame(width: 100, height: 100)
                        .rotationEffect(.degrees(-90))
                    
                    Text("\(appState.currentUser?.wellnessScore ?? 82)")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }
                
                VStack(alignment: .leading, spacing: 6) {
                    Text("Ready for Shift")
                        .font(.appSubheadline)
                        .foregroundColor(.appAccent)
                    
                    Text("You're in the top 15% today")
                        .font(.appSmall)
                        .foregroundColor(.appTextSecondary)
                        .italic()
                }
                
                Spacer()
                
                // Leaf decoration
                Image(systemName: "leaf.fill")
                    .font(.system(size: 50))
                    .foregroundColor(.appCardBorder)
                    .rotationEffect(.degrees(-30))
            }
        }
        .padding(20)
        .background(Color.appCardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
    
    private var quickActionsRow: some View {
        HStack(spacing: 12) {
            QuickActionButton(icon: "exclamationmark.triangle.fill", label: "SOS", color: .appUrgentRed)
                .onTapGesture { showSOSSheet = true }
            
            QuickActionButton(icon: "figure.mind.and.body", label: "Breathe", color: .appSosBlue)
                .onTapGesture { selectedActivity = sampleActivities[0] }
            
            QuickActionButton(icon: "person.2.fill", label: "Community", color: Color(hex: "A855F7"))
                .onTapGesture { showCommunitySheet = true }
            
            QuickActionButton(icon: "chart.line.uptrend.xyaxis", label: "Stats", color: Color(hex: "F59E0B"))
        }
    }
    
    private var forYouSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("For You")
                    .font(.appHeadline)
                    .foregroundColor(.white)
                
                Spacer()
                
                Button("See all") {}
                    .font(.appCaption)
                    .foregroundColor(.appAccent)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(sampleActivities) { activity in
                        ActivityCard(activity: activity)
                            .onTapGesture {
                                selectedActivity = activity
                            }
                    }
                }
            }
        }
    }
    
    private var weeklySnapshotCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Weekly Snapshot")
                    .font(.appHeadline)
                    .foregroundColor(.white)
                
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Mood Trends")
                        .font(.appSubheadline)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 12))
                        Text("+12% this week")
                            .font(.appSmall)
                    }
                    .foregroundColor(.appAccent)
                }
                
                // Mini Chart
                MiniWeekChart()
            }
            .padding(20)
            .appCard()
        }
    }
}

struct QuickActionButton: View {
    let icon: String
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                RoundedRectangle(cornerRadius: 14)
                    .fill(color.opacity(0.15))
                    .frame(width: 56, height: 56)
                
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundColor(color)
            }
            
            Text(label)
                .font(.appSmall)
                .foregroundColor(.appTextSecondary)
        }
        .frame(maxWidth: .infinity)
    }
}

struct ActivityCard: View {
    let activity: WellnessActivity
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Image placeholder with gradient
            ZStack(alignment: .bottomLeading) {
                LinearGradient(
                    colors: [Color(hex: activity.category.color).opacity(0.8), Color(hex: activity.category.color).opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                
                // Decorative pattern
                Image(systemName: "waveform")
                    .font(.system(size: 60))
                    .foregroundColor(.white.opacity(0.2))
                    .rotationEffect(.degrees(-15))
                    .offset(x: 60, y: -20)
                
                HStack {
                    Text("\(activity.duration) MIN")
                        .font(.appSmall)
                        .foregroundColor(.white)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.black.opacity(0.4))
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
                .padding(12)
            }
            .frame(width: 160, height: 100)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            
            Text(activity.title)
                .font(.appSubheadline)
                .foregroundColor(.white)
            
            Text(activity.category.rawValue)
                .font(.appSmall)
                .foregroundColor(Color(hex: activity.category.color))
        }
        .frame(width: 160)
    }
}

struct MiniWeekChart: View {
    let dayLabels = ["M", "T", "W", "T", "F", "S", "S"]
    let values: [CGFloat] = [0.4, 0.6, 0.5, 0.7, 0.55, 0.8, 0.85]
    
    var body: some View {
        HStack(alignment: .bottom, spacing: 12) {
            ForEach(0..<7, id: \.self) { index in
                VStack(spacing: 6) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(index == 3 ? Color.appAccent : Color.appCardBorder)
                        .frame(width: 24, height: 60 * values[index])
                    
                    Text(dayLabels[index])
                        .font(.appSmall)
                        .foregroundColor(index == 3 ? .appAccent : .appTextMuted)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .frame(height: 80)
    }
}

#Preview {
    WellnessDashboardView()
        .environmentObject(AppState())
}
