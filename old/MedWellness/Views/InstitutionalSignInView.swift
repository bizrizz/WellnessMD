import SwiftUI

struct InstitutionalSignInView: View {
    @EnvironmentObject var appState: AppState
    @State private var searchText = ""
    @State private var selectedInstitution: Institution?
    
    var filteredInstitutions: [Institution] {
        if searchText.isEmpty {
            return sampleInstitutions
        }
        return sampleInstitutions.filter { $0.name.localizedCaseInsensitiveContains(searchText) || $0.location.localizedCaseInsensitiveContains(searchText) }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Header Image Card
                    headerCard
                        .padding(.horizontal, 20)
                        .padding(.top, 8)
                    
                    // Search Field
                    searchField
                        .padding(.horizontal, 20)
                        .padding(.top, 24)
                    
                    // Nearby Organizations
                    VStack(alignment: .leading, spacing: 12) {
                        Text("NEARBY ORGANIZATIONS")
                            .font(.appSmall)
                            .foregroundColor(.appTextMuted)
                            .tracking(1.5)
                            .padding(.leading, 20)
                        
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(filteredInstitutions) { institution in
                                    InstitutionCard(
                                        institution: institution,
                                        isSelected: selectedInstitution?.id == institution.id
                                    )
                                    .onTapGesture {
                                        withAnimation(.spring(response: 0.3)) {
                                            selectedInstitution = institution
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                    .padding(.top, 24)
                    
                    Spacer()
                    
                    // Sign In Button
                    VStack(spacing: 16) {
                        Button(action: signIn) {
                            HStack(spacing: 10) {
                                Image(systemName: "arrow.right.square.fill")
                                Text("Sign in with Institution")
                            }
                        }
                        .buttonStyle(AppPrimaryButtonStyle(isEnabled: selectedInstitution != nil))
                        .disabled(selectedInstitution == nil)
                        
                        VStack(spacing: 4) {
                            Text("Can't find your organization?")
                                .font(.appSmall)
                                .foregroundColor(.appTextMuted)
                            
                            Button("Contact Support") {
                                // Contact support action
                            }
                            .font(.appCaption)
                            .foregroundColor(.appAccent)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("Institutional Sign-In")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {}) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(.white)
                    }
                }
            }
        }
    }
    
    private var headerCard: some View {
        ZStack(alignment: .bottomLeading) {
            // Background image placeholder with gradient
            LinearGradient(
                colors: [
                    Color(hex: "2D4A3E"),
                    Color(hex: "1A3028")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .overlay(
                Image(systemName: "building.2.crop.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120)
                    .foregroundColor(.white.opacity(0.1))
                    .offset(x: 80, y: -20)
            )
            
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.shield.fill")
                        .foregroundColor(.appAccent)
                    Text("SECURE ACCESS")
                        .font(.appSmall)
                        .foregroundColor(.appAccent)
                        .tracking(1.2)
                }
                
                Text("Welcome to Wellness")
                    .font(.appTitle)
                    .foregroundColor(.white)
                
                Text("Select your organization to access your dedicated burnout prevention resources.")
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary)
                    .lineLimit(2)
            }
            .padding(20)
        }
        .frame(height: 180)
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
    
    private var searchField: some View {
        HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.appTextMuted)
            
                    TextField("", text: $searchText, prompt: Text("Search for your hospital or university...")
                        .foregroundColor(.appTextMuted))
                .foregroundColor(.white)
                .autocorrectionDisabled()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(Color.appCardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.appCardBorder, lineWidth: 1)
        )
    }
    
    private func signIn() {
        guard let institution = selectedInstitution else { return }
        withAnimation {
            appState.signIn(with: institution)
        }
    }
}

struct InstitutionCard: View {
    let institution: Institution
    let isSelected: Bool
    
    var body: some View {
        HStack(spacing: 16) {
            // Icon
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color(hex: institution.color).opacity(0.2))
                    .frame(width: 50, height: 50)
                
                Image(systemName: institution.icon)
                    .font(.system(size: 20))
                    .foregroundColor(Color(hex: institution.color))
            }
            
            // Text
            VStack(alignment: .leading, spacing: 4) {
                Text(institution.name)
                    .font(.appSubheadline)
                    .foregroundColor(.white)
                
                Text(institution.location)
                    .font(.appSmall)
                    .foregroundColor(.appTextMuted)
            }
            
            Spacer()
            
            // Arrow
            Image(systemName: "chevron.right")
                .foregroundColor(.appTextMuted)
        }
        .padding(16)
        .selectionCard(isSelected: isSelected)
    }
}

#Preview {
    InstitutionalSignInView()
        .environmentObject(AppState())
}
