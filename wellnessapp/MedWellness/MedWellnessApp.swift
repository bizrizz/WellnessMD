import SwiftUI

@main
struct MedWellnessApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .preferredColorScheme(.dark)
        }
    }
}

// MARK: - App State
class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var hasCompletedOnboarding = false
    @Published var currentUser: User?
    @Published var selectedInstitution: Institution?
    
    func signIn(with institution: Institution) {
        selectedInstitution = institution
        isAuthenticated = true
    }
    
    func completeOnboarding(role: UserRole, stressors: [String], goals: [String]) {
        currentUser = User(
            id: UUID(),
            name: "Dr. Smith",
            role: role,
            institution: selectedInstitution?.name ?? "Unknown",
            email: "smith@hospital.ca",
            wellnessScore: 82,
            streak: 7,
            sessionsCompleted: 10,
            stressors: stressors,
            goals: goals
        )
        hasCompletedOnboarding = true
    }
}

// MARK: - Content View
struct ContentView: View {
    @EnvironmentObject var appState: AppState
    
    var body: some View {
        Group {
            if !appState.isAuthenticated {
                InstitutionalSignInView()
            } else if !appState.hasCompletedOnboarding {
                PersonalizationWizardView()
            } else {
                MainTabView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: appState.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: appState.hasCompletedOnboarding)
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
