import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var appState: AppState
    @State private var darkModeEnabled = true
    @State private var smartAlertsEnabled = true
    @State private var alertFrequency: Double = 0.6
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Profile Header
                        profileHeader
                        
                        // Achievements
                        achievementsSection
                        
                        // Alert Fatigue Protection
                        alertSection
                        
                        // Preferences
                        preferencesSection
                        
                        // Sign Out
                        signOutButton
                        
                        // Version
                        Text("Wellness for Medics v2.4.1")
                            .font(.appSmall)
                            .foregroundColor(.appTextMuted)
                            .padding(.top, 8)
                        
                        Spacer(minLength: 100)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "gearshape.fill")
                            .foregroundColor(.appTextSecondary)
                    }
                }
            }
        }
    }
    
    private var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack(alignment: .bottomTrailing) {
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [Color(hex: "0D9488"), Color(hex: "14B8A6")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 100, height: 100)
                    
                    Image(systemName: "person.fill")
                        .font(.system(size: 45))
                        .foregroundColor(.white)
                }
                
                // Edit button
                Button(action: {}) {
                    ZStack {
                        Circle()
                            .fill(Color.appAccent)
                            .frame(width: 32, height: 32)
                        
                        Image(systemName: "pencil")
                            .font(.system(size: 14))
                            .foregroundColor(.black)
                    }
                }
            }
            
            VStack(spacing: 4) {
                Text(appState.currentUser?.name ?? "Dr. Smith")
                    .font(.appHeadline)
                    .foregroundColor(.white)
                
                Text(appState.currentUser?.roleDescription ?? "PGY-2 Internal Medicine Resident")
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary)
                
                Text(appState.selectedInstitution?.name ?? "Kingston Health Sciences Centre")
                    .font(.appSmall)
                    .foregroundColor(.appTextMuted)
            }
        }
        .padding(.vertical, 8)
    }
    
    private var achievementsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Achievements")
                .font(.appSubheadline)
                .foregroundColor(.white)
            
            HStack(spacing: 12) {
                AchievementCard(
                    icon: "flame.fill",
                    title: "\(appState.currentUser?.streak ?? 7)-Day Streak",
                    subtitle: "Wellness consistent",
                    color: Color(hex: "F97316")
                )
                
                AchievementCard(
                    icon: "star.fill",
                    title: "\(appState.currentUser?.sessionsCompleted ?? 10) Sessions",
                    subtitle: "Mindfulness hero",
                    color: Color.appAccent
                )
            }
        }
    }
    
    private var alertSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Alert Fatigue Protection")
                    .font(.appSubheadline)
                    .foregroundColor(.white)
                
                Text("Customize notifications to preserve clinical focus.")
                    .font(.appSmall)
                    .foregroundColor(.appTextMuted)
            }
            
            VStack(spacing: 16) {
                // Smart Alerts Toggle
                HStack {
                    ZStack {
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color(hex: "F59E0B").opacity(0.2))
                            .frame(width: 40, height: 40)
                        
                        Image(systemName: "bell.badge.fill")
                            .foregroundColor(Color(hex: "F59E0B"))
                    }
                    
                    Text("Enable Smart Alerts")
                        .font(.appBody)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Toggle("", isOn: $smartAlertsEnabled)
                        .tint(.appAccent)
                }
                
                // Frequency Slider
                VStack(alignment: .leading, spacing: 8) {
                    Text("FREQUENCY DENSITY")
                        .font(.appSmall)
                        .foregroundColor(.appTextMuted)
                        .tracking(1)
                    
                    HStack {
                        Text("Low")
                            .font(.appSmall)
                            .foregroundColor(.appTextMuted)
                        
                        Slider(value: $alertFrequency, in: 0...1)
                            .tint(.appSosBlue)
                        
                        Text("Medium")
                            .font(.appSmall)
                            .foregroundColor(.appSosBlue)
                    }
                }
                
                // Quiet Hours
                Button(action: {}) {
                    HStack {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10)
                                .fill(Color.appSosBlue.opacity(0.2))
                                .frame(width: 40, height: 40)
                            
                            Image(systemName: "moon.fill")
                                .foregroundColor(.appSosBlue)
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Quiet Hours")
                                .font(.appBody)
                                .foregroundColor(.white)
                            
                            Text("22:00 - 06:00")
                                .font(.appSmall)
                                .foregroundColor(.appTextMuted)
                        }
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .foregroundColor(.appTextMuted)
                    }
                }
            }
            .padding(20)
            .appCard()
        }
    }
    
    private var preferencesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Preferences")
                .font(.appSubheadline)
                .foregroundColor(.white)
            
            VStack(spacing: 0) {
                // Dark Mode
                PreferenceRow(
                    icon: "moon.fill",
                    iconColor: Color(hex: "6366F1"),
                    title: "Dark Mode",
                    trailing: {
                        Toggle("", isOn: $darkModeEnabled)
                            .tint(.appAccent)
                    }
                )
                
                Divider()
                    .background(Color.appCardBorder)
                
                // Institutional Email
                PreferenceRow(
                    icon: "building.2.fill",
                    iconColor: Color.appAccent,
                    title: "Institutional Email",
                    trailing: {
                        Text("Verified")
                            .font(.appSmall)
                            .foregroundColor(.appAccent)
                    }
                )
                
                Divider()
                    .background(Color.appCardBorder)
                
                // Privacy & Data
                PreferenceRow(
                    icon: "shield.fill",
                    iconColor: Color(hex: "10B981"),
                    title: "Privacy & Data",
                    trailing: {
                        Image(systemName: "chevron.right")
                            .foregroundColor(.appTextMuted)
                    }
                )
            }
            .appCard()
        }
    }
    
    private var signOutButton: some View {
        Button(action: signOut) {
            HStack {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                Text("Sign Out")
            }
            .font(.appCaption)
            .foregroundColor(.appAccent)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color.appCardBackground.opacity(0.5))
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }
    
    private func signOut() {
        withAnimation {
            appState.isAuthenticated = false
            appState.hasCompletedOnboarding = false
            appState.currentUser = nil
        }
    }
}

struct AchievementCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(color)
            
            Spacer()
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.appSubheadline)
                    .foregroundColor(.white)
                
                Text(subtitle)
                    .font(.appSmall)
                    .foregroundColor(.appTextMuted)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .frame(height: 120)
        .appCard()
    }
}

struct PreferenceRow<Trailing: View>: View {
    let icon: String
    let iconColor: Color
    let title: String
    let trailing: () -> Trailing
    
    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(iconColor.opacity(0.2))
                    .frame(width: 36, height: 36)
                
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(iconColor)
            }
            
            Text(title)
                .font(.appBody)
                .foregroundColor(.white)
            
            Spacer()
            
            trailing()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

#Preview {
    ProfileView()
        .environmentObject(AppState())
}
