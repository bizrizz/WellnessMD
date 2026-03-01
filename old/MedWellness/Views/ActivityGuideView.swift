import SwiftUI

struct ActivityGuideView: View {
    let activity: WellnessActivity
    @Environment(\.dismiss) var dismiss
    @State private var currentStep = 0
    @State private var timeRemaining = 0
    @State private var isPlaying = true
    @State private var timer: Timer?
    
    var currentActivityStep: ActivityStep {
        activity.steps[currentStep]
    }
    
    var progress: CGFloat {
        CGFloat(currentStep + 1) / CGFloat(activity.steps.count)
    }
    
    var body: some View {
        ZStack {
            // Background
            backgroundGradient
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                header
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                
                // Progress Bar
                progressBar
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                
                Spacer()
                
                // Content Card
                contentCard
                    .padding(.horizontal, 20)
                
                Spacer()
                
                // Timer
                timerDisplay
                
                // Controls
                controlButtons
                    .padding(.horizontal, 20)
                    .padding(.bottom, 32)
            }
        }
        .onAppear { startTimer() }
        .onDisappear { stopTimer() }
    }
    
    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(hex: "3D5A4C"),
                Color(hex: "2A3F35"),
                Color(hex: "1A2820")
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .overlay(
            Image(systemName: "leaf.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 300)
                .foregroundColor(.white.opacity(0.03))
                .rotationEffect(.degrees(-30))
                .offset(x: 100, y: -200)
        )
    }
    
    private var header: some View {
        HStack {
            Button(action: { dismiss() }) {
                Image(systemName: "xmark")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white)
            }
            
            Spacer()
            
            Text("\(activity.duration)-Min Burnout Relief")
                .font(.appSubheadline)
                .foregroundColor(.white)
            
            Spacer()
            
            Button(action: {}) {
                Image(systemName: "speaker.wave.2.fill")
                    .font(.system(size: 18))
                    .foregroundColor(.white)
            }
        }
    }
    
    private var progressBar: some View {
        VStack(spacing: 8) {
            HStack {
                Text("STEP \(currentStep + 1) OF \(activity.steps.count)")
                    .font(.appSmall)
                    .foregroundColor(.appTextMuted)
                    .tracking(1)
                
                Spacer()
                
                Text(currentActivityStep.name)
                    .font(.appCaption)
                    .foregroundColor(.white)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.white.opacity(0.2))
                        .frame(height: 6)
                    
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.appAccent)
                        .frame(width: geometry.size.width * progress, height: 6)
                        .animation(.spring(response: 0.3), value: progress)
                }
            }
            .frame(height: 6)
        }
    }
    
    private var contentCard: some View {
        VStack(spacing: 20) {
            // Video placeholder
            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.white.opacity(0.1))
                    .frame(height: 200)
                
                // Decorative yoga figure
                Image(systemName: "figure.yoga")
                    .font(.system(size: 80))
                    .foregroundColor(.white.opacity(0.3))
                
                // Play button overlay
                Circle()
                    .fill(Color.white.opacity(0.3))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.white)
                    )
                    .onTapGesture { togglePlayPause() }
            }
            
            VStack(alignment: .leading, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(currentActivityStep.name)
                        .font(.appTitle)
                        .foregroundColor(.white)
                    
                    Text("(\(currentActivityStep.subtitle))")
                        .font(.appSubheadline)
                        .foregroundColor(.appTextSecondary)
                }
                
                Text(currentActivityStep.description)
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary)
                    .lineSpacing(4)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(24)
        .background(Color.black.opacity(0.3))
        .clipShape(RoundedRectangle(cornerRadius: 24))
    }
    
    private var timerDisplay: some View {
        HStack(spacing: 8) {
            TimeUnitDisplay(value: timeRemaining / 60, unit: "MIN")
            
            Text(":")
                .font(.system(size: 36, weight: .light))
                .foregroundColor(.white.opacity(0.5))
            
            TimeUnitDisplay(value: timeRemaining % 60, unit: "SEC")
        }
        .padding(.vertical, 24)
    }
    
    private var controlButtons: some View {
        VStack(spacing: 16) {
            Button(action: nextStep) {
                HStack {
                    Text(currentStep == activity.steps.count - 1 ? "Finish" : "Done")
                    Image(systemName: "chevron.right")
                }
            }
            .buttonStyle(AppPrimaryButtonStyle())
            
            HStack {
                Button(action: previousStep) {
                    HStack(spacing: 4) {
                        Image(systemName: "backward.end.fill")
                        Text("BACK")
                    }
                    .font(.appSmall)
                    .foregroundColor(.appTextMuted)
                }
                .opacity(currentStep > 0 ? 1 : 0.3)
                .disabled(currentStep == 0)
                
                Spacer()
                
                Button(action: skipStep) {
                    HStack(spacing: 4) {
                        Text("SKIP")
                        Image(systemName: "forward.end.fill")
                    }
                    .font(.appSmall)
                    .foregroundColor(.appTextMuted)
                }
                .opacity(currentStep < activity.steps.count - 1 ? 1 : 0.3)
                .disabled(currentStep == activity.steps.count - 1)
            }
        }
    }
    
    private func startTimer() {
        timeRemaining = currentActivityStep.durationSeconds
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if isPlaying && timeRemaining > 0 {
                timeRemaining -= 1
            } else if timeRemaining == 0 {
                autoAdvance()
            }
        }
    }
    
    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
    
    private func togglePlayPause() {
        isPlaying.toggle()
    }
    
    private func nextStep() {
        if currentStep < activity.steps.count - 1 {
            withAnimation {
                currentStep += 1
                timeRemaining = currentActivityStep.durationSeconds
            }
        } else {
            dismiss()
        }
    }
    
    private func previousStep() {
        if currentStep > 0 {
            withAnimation {
                currentStep -= 1
                timeRemaining = currentActivityStep.durationSeconds
            }
        }
    }
    
    private func skipStep() {
        if currentStep < activity.steps.count - 1 {
            withAnimation {
                currentStep += 1
                timeRemaining = currentActivityStep.durationSeconds
            }
        }
    }
    
    private func autoAdvance() {
        if currentStep < activity.steps.count - 1 {
            withAnimation {
                currentStep += 1
                timeRemaining = currentActivityStep.durationSeconds
            }
        }
    }
}

struct TimeUnitDisplay: View {
    let value: Int
    let unit: String
    
    var body: some View {
        VStack(spacing: 4) {
            Text(String(format: "%02d", value))
                .font(.system(size: 48, weight: .light, design: .rounded))
                .foregroundColor(value > 0 ? .white : .appAccent)
                .monospacedDigit()
                .frame(width: 100)
                .padding(.vertical, 16)
                .background(Color.white.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 16))
            
            Text(unit)
                .font(.appSmall)
                .foregroundColor(.appTextMuted)
                .tracking(1.5)
        }
    }
}

#Preview {
    ActivityGuideView(activity: sampleActivities[1])
}
