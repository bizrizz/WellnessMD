import SwiftUI

struct PersonalizationWizardView: View {
    @EnvironmentObject var appState: AppState
    @State private var currentStep = 0
    @State private var selectedRole: UserRole = .student
    @State private var selectedStressors: Set<String> = []
    @State private var selectedGoals: Set<String> = []
    @State private var selectedFrequency: String = ""
    
    private let totalSteps = 4
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Progress Header
                    progressHeader
                        .padding(.horizontal, 20)
                        .padding(.top, 8)
                    
                    // Question Content
                    TabView(selection: $currentStep) {
                        roleSelectionView
                            .tag(0)
                        
                        stressorsView
                            .tag(1)
                        
                        goalsView
                            .tag(2)
                        
                        frequencyView
                            .tag(3)
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .animation(.easeInOut, value: currentStep)
                    
                    // Privacy Notice & Continue Button
                    VStack(spacing: 20) {
                        if currentStep == 0 {
                            privacyNotice
                        }
                        
                        Button(action: nextStep) {
                            Text(currentStep == totalSteps - 1 ? "Get Started" : "Continue")
                        }
                        .buttonStyle(AppPrimaryButtonStyle(isEnabled: canContinue))
                        .disabled(!canContinue)
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 32)
                }
            }
            .navigationTitle("Personalization")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: previousStep) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(.white)
                    }
                    .opacity(currentStep > 0 ? 1 : 0)
                }
            }
        }
    }
    
    private var canContinue: Bool {
        switch currentStep {
        case 0: return true
        case 1: return !selectedStressors.isEmpty
        case 2: return !selectedGoals.isEmpty
        case 3: return !selectedFrequency.isEmpty
        default: return false
        }
    }
    
    private var progressHeader: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Onboarding Progress")
                    .font(.appCaption)
                    .foregroundColor(.appTextSecondary)
                
                Spacer()
                
                Text("\(currentStep + 1) of \(totalSteps)")
                    .font(.appCaption)
                    .foregroundColor(.appTextSecondary)
            }
            
            // Progress Bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.appCardBorder)
                        .frame(height: 6)
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.appAccent)
                        .frame(width: geometry.size.width * CGFloat(currentStep + 1) / CGFloat(totalSteps), height: 6)
                        .animation(.spring(response: 0.3), value: currentStep)
                }
            }
            .frame(height: 6)
        }
    }
    
    private var roleSelectionView: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 12) {
                Text("What is your current role?")
                    .font(.appTitle)
                    .foregroundColor(.white)
                
                Text("We tailor your wellness insights and burnout risk assessments based on your professional stage and unique daily challenges.")
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary)
            }
            .padding(.horizontal, 20)
            .padding(.top, 24)
            
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(UserRole.allCases, id: \.self) { role in
                        RoleCard(
                            role: role,
                            isSelected: selectedRole == role
                        )
                        .onTapGesture {
                            withAnimation(.spring(response: 0.3)) {
                                selectedRole = role
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
            }
            
            Spacer()
        }
    }
    
    private var stressorsView: some View {
        multiSelectView(
            title: "What challenges you most?",
            subtitle: "Select all that apply. This helps us personalize your interventions.",
            options: onboardingQuestions[1].options,
            selectedItems: $selectedStressors
        )
    }
    
    private var goalsView: some View {
        multiSelectView(
            title: "What are your wellness goals?",
            subtitle: "We'll track progress and celebrate your achievements.",
            options: onboardingQuestions[2].options,
            selectedItems: $selectedGoals
        )
    }
    
    private var frequencyView: some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 12) {
                Text("How often can you practice?")
                    .font(.appTitle)
                    .foregroundColor(.white)
                
                Text("We'll adapt our recommendations to fit your schedule.")
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary)
            }
            .padding(.horizontal, 20)
            .padding(.top, 24)
            
            ScrollView {
                VStack(spacing: 12) {
                    ForEach(onboardingQuestions[3].options) { option in
                        OptionCard(
                            option: option,
                            isSelected: selectedFrequency == option.title
                        )
                        .onTapGesture {
                            withAnimation(.spring(response: 0.3)) {
                                selectedFrequency = option.title
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
            }
            
            Spacer()
        }
    }
    
    private func multiSelectView(title: String, subtitle: String, options: [OnboardingOption], selectedItems: Binding<Set<String>>) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            VStack(alignment: .leading, spacing: 12) {
                Text(title)
                    .font(.appTitle)
                    .foregroundColor(.white)
                
                Text(subtitle)
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary)
            }
            .padding(.horizontal, 20)
            .padding(.top, 24)
            
            ScrollView {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(options) { option in
                        CompactOptionCard(
                            option: option,
                            isSelected: selectedItems.wrappedValue.contains(option.title)
                        )
                        .onTapGesture {
                            withAnimation(.spring(response: 0.3)) {
                                if selectedItems.wrappedValue.contains(option.title) {
                                    selectedItems.wrappedValue.remove(option.title)
                                } else {
                                    selectedItems.wrappedValue.insert(option.title)
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
            }
            
            Spacer()
        }
    }
    
    private var privacyNotice: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "checkmark.shield.fill")
                .foregroundColor(.appAccent)
            
            Text("Your privacy is our priority. We use your professional status only to provide clinically relevant resources. You can change this later in settings.")
                .font(.appSmall)
                .foregroundColor(.appTextSecondary)
        }
        .padding(16)
        .background(Color.appCardBackground.opacity(0.5))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    private func nextStep() {
        if currentStep < totalSteps - 1 {
            withAnimation {
                currentStep += 1
            }
        } else {
            completeOnboarding()
        }
    }
    
    private func previousStep() {
        if currentStep > 0 {
            withAnimation {
                currentStep -= 1
            }
        }
    }
    
    private func completeOnboarding() {
        appState.completeOnboarding(
            role: selectedRole,
            stressors: Array(selectedStressors),
            goals: Array(selectedGoals)
        )
    }
}

struct RoleCard: View {
    let role: UserRole
    let isSelected: Bool
    
    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text(role.rawValue)
                    .font(.appSubheadline)
                    .foregroundColor(.white)
                
                Text(role.description)
                    .font(.appSmall)
                    .foregroundColor(.appTextSecondary)
            }
            
            Spacer()
            
            // Radio button
            ZStack {
                Circle()
                    .stroke(isSelected ? Color.appAccent : Color.appCardBorder, lineWidth: 2)
                    .frame(width: 24, height: 24)
                
                if isSelected {
                    Circle()
                        .fill(Color.appAccent)
                        .frame(width: 12, height: 12)
                }
            }
        }
        .padding(20)
        .selectionCard(isSelected: isSelected)
    }
}

struct OptionCard: View {
    let option: OnboardingOption
    let isSelected: Bool
    
    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: option.icon)
                .font(.system(size: 20))
                .foregroundColor(isSelected ? .appAccent : .appTextSecondary)
                .frame(width: 32)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(option.title)
                    .font(.appSubheadline)
                    .foregroundColor(.white)
                
                Text(option.description)
                    .font(.appSmall)
                    .foregroundColor(.appTextSecondary)
            }
            
            Spacer()
            
            // Radio button
            ZStack {
                Circle()
                    .stroke(isSelected ? Color.appAccent : Color.appCardBorder, lineWidth: 2)
                    .frame(width: 24, height: 24)
                
                if isSelected {
                    Circle()
                        .fill(Color.appAccent)
                        .frame(width: 12, height: 12)
                }
            }
        }
        .padding(16)
        .selectionCard(isSelected: isSelected)
    }
}

struct CompactOptionCard: View {
    let option: OnboardingOption
    let isSelected: Bool
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: option.icon)
                .font(.system(size: 24))
                .foregroundColor(isSelected ? .appAccent : .appTextSecondary)
            
            Text(option.title)
                .font(.appCaption)
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
            
            Text(option.description)
                .font(.appSmall)
                .foregroundColor(.appTextMuted)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .padding(.horizontal, 12)
        .selectionCard(isSelected: isSelected)
    }
}

#Preview {
    PersonalizationWizardView()
        .environmentObject(AppState())
}
