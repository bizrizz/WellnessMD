import SwiftUI

struct QuickReliefView: View {
    @Environment(\.dismiss) var dismiss
    @State private var breathPhase = BreathPhase.inhale
    @State private var breathTimer: Timer?
    @State private var circleScale: CGFloat = 0.7
    @State private var isBreathing = false
    @State private var completedSteps: Set<Int> = []
    
    enum BreathPhase: String {
        case inhale = "Breathe In"
        case hold = "Hold"
        case exhale = "Breathe Out"
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appSosBackground
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 32) {
                        // Header
                        VStack(spacing: 8) {
                            Text("Take a Breath")
                                .font(.appTitle)
                                .foregroundColor(.white)
                            
                            Text("Find a quiet space. You are in control.")
                                .font(.appBody)
                                .foregroundColor(.appTextSecondary)
                        }
                        .padding(.top, 24)
                        
                        // Breathing Circle
                        breathingCircle
                        
                        // Grounding Section
                        groundingSection
                        
                        // Emergency Contact
                        emergencyCard
                        
                        Spacer(minLength: 40)
                    }
                    .padding(.horizontal, 20)
                }
            }
            .navigationTitle("Quick Relief (SOS)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.white)
                    }
                }
            }
        }
        .onDisappear { stopBreathing() }
    }
    
    private var breathingCircle: some View {
        Button(action: toggleBreathing) {
            ZStack {
                // Outer glow
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [Color.appSosBlue.opacity(0.3), Color.clear],
                            center: .center,
                            startRadius: 60,
                            endRadius: 140
                        )
                    )
                    .frame(width: 280, height: 280)
                
                // Main circle
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color.appSosBlue, Color(hex: "2563EB")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 180, height: 180)
                    .scaleEffect(circleScale)
                    .animation(.easeInOut(duration: 4), value: circleScale)
                
                VStack(spacing: 8) {
                    Image(systemName: "wind")
                        .font(.system(size: 32))
                    
                    Text(isBreathing ? breathPhase.rawValue : "Start 1-Min\nBreathing")
                        .font(.appSubheadline)
                        .multilineTextAlignment(.center)
                }
                .foregroundColor(.white)
            }
        }
        .padding(.vertical, 20)
    }
    
    private var groundingSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Image(systemName: "questionmark.circle.fill")
                    .foregroundColor(.appSosBlue)
                
                Text("Grounding (5-4-3-2-1)")
                    .font(.appHeadline)
                    .foregroundColor(.white)
            }
            
            VStack(spacing: 12) {
                ForEach(groundingSteps) { step in
                    GroundingStepCard(
                        step: step,
                        isCompleted: completedSteps.contains(step.number)
                    )
                    .onTapGesture {
                        withAnimation {
                            if completedSteps.contains(step.number) {
                                completedSteps.remove(step.number)
                            } else {
                                completedSteps.insert(step.number)
                            }
                        }
                    }
                }
            }
        }
    }
    
    private var emergencyCard: some View {
        VStack(spacing: 16) {
            Image(systemName: "staroflife.fill")
                .font(.system(size: 24))
                .foregroundColor(.appUrgentRed)
            
            Text("Need urgent help?")
                .font(.appSubheadline)
                .foregroundColor(.appUrgentRed)
            
            Text("Connect with immediate professional support or peer counseling.")
                .font(.appBody)
                .foregroundColor(.appTextSecondary)
                .multilineTextAlignment(.center)
            
            Button(action: {}) {
                HStack {
                    Image(systemName: "phone.fill")
                    Text("Emergency Contact")
                }
                .font(.appCaption)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.appUrgentRed)
                .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding(20)
        .background(Color.appUrgentRed.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 20))
    }
    
    private func toggleBreathing() {
        if isBreathing {
            stopBreathing()
        } else {
            startBreathing()
        }
    }
    
    private func startBreathing() {
        isBreathing = true
        runBreathCycle()
    }
    
    private func stopBreathing() {
        isBreathing = false
        breathTimer?.invalidate()
        breathTimer = nil
        circleScale = 0.7
    }
    
    private func runBreathCycle() {
        guard isBreathing else { return }
        
        // Inhale
        breathPhase = .inhale
        circleScale = 1.0
        
        breathTimer = Timer.scheduledTimer(withTimeInterval: 4, repeats: false) { _ in
            guard self.isBreathing else { return }
            
            // Hold
            self.breathPhase = .hold
            
            self.breathTimer = Timer.scheduledTimer(withTimeInterval: 4, repeats: false) { _ in
                guard self.isBreathing else { return }
                
                // Exhale
                self.breathPhase = .exhale
                self.circleScale = 0.7
                
                self.breathTimer = Timer.scheduledTimer(withTimeInterval: 4, repeats: false) { _ in
                    self.runBreathCycle()
                }
            }
        }
    }
}

struct GroundingStepCard: View {
    let step: GroundingStep
    let isCompleted: Bool
    
    var body: some View {
        HStack(spacing: 16) {
            // Number badge
            ZStack {
                Circle()
                    .fill(isCompleted ? Color.appSosBlue : Color.appSosBlue.opacity(0.2))
                    .frame(width: 40, height: 40)
                
                Text("\(step.number)")
                    .font(.appSubheadline)
                    .foregroundColor(isCompleted ? .white : .appSosBlue)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(step.sense)
                    .font(.appSubheadline)
                    .foregroundColor(.white)
                
                Text(step.instruction)
                    .font(.appSmall)
                    .foregroundColor(.appTextSecondary)
            }
            
            Spacer()
            
            Image(systemName: step.icon)
                .font(.system(size: 20))
                .foregroundColor(.appTextMuted)
        }
        .padding(16)
        .background(isCompleted ? Color.appSosBlue.opacity(0.15) : Color.appCommunityCard)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(isCompleted ? Color.appSosBlue : Color.clear, lineWidth: 1)
        )
    }
}

#Preview {
    QuickReliefView()
}
