# MedWellness 🧘‍♂️

A specialized wellness and burnout prevention app designed for the high-pressure environment of medical school and residency.

## 📱 Features

### 1. Institutional Sign-In
- Secure SSO integration with hospitals and medical schools
- Location-based institution discovery
- Organizational wellness resource access

### 2. Personalization Wizard
- Role-based onboarding (Student, Resident, Physician)
- Stress trigger identification
- Wellness goal setting
- Schedule-adaptive recommendations

### 3. Wellness Dashboard
- Daily Wellness Score with circular progress indicator
- Personalized activity recommendations
- Weekly mood trend snapshots
- Quick action buttons for immediate access

### 4. Wellness Analytics
- Interactive stress trend charts
- Time-range filtering (1W, 1M, 3M)
- AI-powered insights on stress patterns
- Intervention effectiveness tracking
- Top performing wellness activities

### 5. Step-by-Step Guides
- Iterative yoga and meditation guides
- Beautiful calming video backgrounds
- Timer-based step progression
- Pose instructions with detailed descriptions
- Back/Skip navigation

### 6. Quick Relief (SOS)
- One-minute breathing exercises
- 5-4-3-2-1 grounding technique
- Emergency contact integration
- Immediate stress intervention

### 7. Peer Support Community
- Anonymous posting option
- Category-filtered feed (Residency Life, Study Tips, Mental Health)
- Moderated discussions
- Like, comment, and flag system

### 8. Institution Events Calendar
- Monthly calendar view with event indicators
- RSVP functionality
- Wellness workshops and seminars
- Local wellness event discovery

### 9. Profile & Preferences
- Achievement badges and streaks
- Alert fatigue protection settings
- Quiet hours configuration
- Privacy controls

## 🎨 Design System

### Colors
- **Primary Background**: `#0A1F14` (Deep Forest)
- **Secondary Background**: `#0D2818` (Forest Green)
- **Card Background**: `#132D1B`
- **Accent**: `#4ADE80` (Neon Green)
- **SOS Blue**: `#3B82F6`
- **Urgent Red**: `#EF4444`

### Typography
- **Title**: System Rounded, 28pt Bold
- **Headline**: System Rounded, 22pt Semibold
- **Subheadline**: System Rounded, 18pt Medium
- **Body**: System Default, 16pt Regular
- **Caption**: System Default, 14pt Medium

## 🛠 Technical Requirements

- **iOS**: 17.0+
- **Xcode**: 15.0+
- **Swift**: 5.9+
- **SwiftUI**: Native

## 📂 Project Structure

```
MedWellness/
├── MedWellnessApp.swift       # App entry point
├── Theme/
│   └── AppTheme.swift         # Colors, fonts, modifiers
├── Models/
│   └── Models.swift           # Data models
├── Views/
│   ├── InstitutionalSignInView.swift
│   ├── PersonalizationWizardView.swift
│   ├── MainTabView.swift
│   ├── WellnessDashboardView.swift
│   ├── WellnessAnalyticsView.swift
│   ├── ActivityGuideView.swift
│   ├── QuickReliefView.swift
│   ├── PeerSupportView.swift
│   ├── InstitutionEventsView.swift
│   └── ProfileView.swift
└── Assets.xcassets/
```

## 🚀 Getting Started

1. Open `MedWellness.xcodeproj` in Xcode 15+
2. Select your target device or simulator
3. Build and run (⌘ + R)

## 🔐 Privacy & Security

- End-to-end encrypted medical data
- HIPAA-compliant architecture
- Anonymous posting in community
- Institutional email verification
- Customizable alert fatigue protection

## 📈 Future Enhancements

- [ ] Apple HealthKit integration
- [ ] Watch OS companion app
- [ ] Push notification system
- [ ] Backend API integration
- [ ] Real video content for guides
- [ ] Biometric stress detection

## 👨‍⚕️ Designed For

- Medical Students
- Residents (all specialties)
- Attending Physicians
- Healthcare administrators

---

Built with ❤️ for the mental health of healthcare professionals.

*Wellness for Medics v2.4.1*
