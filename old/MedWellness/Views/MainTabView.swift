import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0
    @State private var showMoodLogger = false
    @State private var showSOSSheet = false
    @State private var showCommunity = false
    
    var body: some View {
        ZStack(alignment: .bottom) {
            TabView(selection: $selectedTab) {
                WellnessDashboardView()
                    .tag(0)
                
                WellnessAnalyticsView()
                    .tag(1)
                
                Color.clear // Placeholder for center button
                    .tag(2)
                
                InstitutionEventsView()
                    .tag(3)
                
                ProfileView()
                    .tag(4)
            }
            
            // Custom Tab Bar
            CustomTabBar(selectedTab: $selectedTab, showMoodLogger: $showMoodLogger)
        }
        .sheet(isPresented: $showMoodLogger) {
            MoodLoggerSheet()
        }
        .fullScreenCover(isPresented: $showSOSSheet) {
            QuickReliefView()
        }
        .fullScreenCover(isPresented: $showCommunity) {
            PeerSupportView()
        }
    }
}

struct CustomTabBar: View {
    @Binding var selectedTab: Int
    @Binding var showMoodLogger: Bool
    
    var body: some View {
        HStack(spacing: 0) {
            TabBarButton(icon: "square.grid.2x2.fill", label: "Home", isSelected: selectedTab == 0)
                .onTapGesture { selectedTab = 0 }
            
            TabBarButton(icon: "chart.bar.fill", label: "Insights", isSelected: selectedTab == 1)
                .onTapGesture { selectedTab = 1 }
            
            // Center Log Mood Button
            Button(action: { showMoodLogger = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "plus")
                        .font(.system(size: 14, weight: .bold))
                    Text("Log")
                        .font(.system(size: 13, weight: .semibold))
                }
                .foregroundColor(.black)
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .background(Color.appAccent)
                .clipShape(Capsule())
            }
            .offset(y: -8)
            
            TabBarButton(icon: "calendar", label: "Events", isSelected: selectedTab == 3)
                .onTapGesture { selectedTab = 3 }
            
            TabBarButton(icon: "person.fill", label: "Profile", isSelected: selectedTab == 4)
                .onTapGesture { selectedTab = 4 }
        }
        .padding(.horizontal, 8)
        .padding(.top, 12)
        .padding(.bottom, 28)
        .background(
            Color.appBackgroundSecondary
                .shadow(color: .black.opacity(0.3), radius: 20, y: -5)
        )
    }
}

struct TabBarButton: View {
    let icon: String
    let label: String
    let isSelected: Bool
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 22))
                .foregroundColor(isSelected ? .appAccent : .appTextMuted)
            
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(isSelected ? .appAccent : .appTextMuted)
        }
        .frame(maxWidth: .infinity)
    }
}

struct MoodLoggerSheet: View {
    @Environment(\.dismiss) var dismiss
    @State private var selectedMood = 5
    @State private var notes = ""
    @State private var selectedActivity: String?
    
    let moods = ["😫", "😔", "😐", "🙂", "😊", "😄", "🤩"]
    let activities = ["After Shift", "Morning", "Before Bed", "After Exercise", "Lunch Break"]
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 32) {
                        // Mood Slider
                        VStack(spacing: 20) {
                            Text("How are you feeling?")
                                .font(.appHeadline)
                                .foregroundColor(.white)
                            
                            Text(moods[min(selectedMood - 1, moods.count - 1)])
                                .font(.system(size: 80))
                            
                            HStack {
                                Text("Struggling")
                                    .font(.appSmall)
                                    .foregroundColor(.appTextMuted)
                                
                                Spacer()
                                
                                Text("Thriving")
                                    .font(.appSmall)
                                    .foregroundColor(.appTextMuted)
                            }
                            
                            Slider(value: Binding(
                                get: { Double(selectedMood) },
                                set: { selectedMood = Int($0) }
                            ), in: 1...7, step: 1)
                            .tint(.appAccent)
                        }
                        .padding(24)
                        .appCard()
                        
                        // When logging
                        VStack(alignment: .leading, spacing: 12) {
                            Text("When?")
                                .font(.appSubheadline)
                                .foregroundColor(.white)
                            
                            FlowLayout(spacing: 10) {
                                ForEach(activities, id: \.self) { activity in
                                    Button(action: { selectedActivity = activity }) {
                                        Text(activity)
                                            .font(.appCaption)
                                            .foregroundColor(selectedActivity == activity ? .black : .appTextSecondary)
                                            .padding(.horizontal, 16)
                                            .padding(.vertical, 10)
                                            .background(selectedActivity == activity ? Color.appAccent : Color.appCardBackground)
                                            .clipShape(Capsule())
                                    }
                                }
                            }
                        }
                        
                        // Notes
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Any notes? (Optional)")
                                .font(.appSubheadline)
                                .foregroundColor(.white)
                            
                            TextEditor(text: $notes)
                                .scrollContentBackground(.hidden)
                                .foregroundColor(.white)
                                .frame(height: 100)
                                .padding(12)
                                .background(Color.appCardBackground)
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        
                        Button(action: saveMood) {
                            Text("Save Entry")
                        }
                        .buttonStyle(AppPrimaryButtonStyle())
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Log Mood")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.appAccent)
                }
            }
        }
    }
    
    private func saveMood() {
        // Save mood entry
        dismiss()
    }
}

// Flow Layout for tags
struct FlowLayout: Layout {
    var spacing: CGFloat = 10
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(in: proposal.width ?? 0, subviews: subviews, spacing: spacing)
        return result.size
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x, y: bounds.minY + result.positions[index].y), proposal: .unspecified)
        }
    }
    
    struct FlowResult {
        var size: CGSize = .zero
        var positions: [CGPoint] = []
        
        init(in width: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var maxHeight: CGFloat = 0
            
            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)
                if x + size.width > width, x > 0 {
                    x = 0
                    y += maxHeight + spacing
                    maxHeight = 0
                }
                positions.append(CGPoint(x: x, y: y))
                maxHeight = max(maxHeight, size.height)
                x += size.width + spacing
            }
            self.size = CGSize(width: width, height: y + maxHeight)
        }
    }
}

#Preview {
    MainTabView()
        .environmentObject(AppState())
}
