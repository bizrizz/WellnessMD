import Foundation

// MARK: - User Model
struct User: Identifiable, Codable {
    let id: UUID
    var name: String
    var role: UserRole
    var institution: String
    var email: String
    var wellnessScore: Int
    var streak: Int
    var sessionsCompleted: Int
    var stressors: [String]
    var goals: [String]
    
    var roleDescription: String {
        switch role {
        case .student:
            return "Medical Student"
        case .resident:
            return "PGY-2 Internal Medicine Resident"
        case .physician:
            return "Attending Physician"
        }
    }
}

enum UserRole: String, Codable, CaseIterable {
    case student = "Medical Student"
    case resident = "Resident"
    case physician = "Physician"
    
    var description: String {
        switch self {
        case .student:
            return "Focus on study-life balance and exam stress"
        case .resident:
            return "Focus on shift recovery and burnout prevention"
        case .physician:
            return "Focus on long-term wellness and sustainability"
        }
    }
    
    var icon: String {
        switch self {
        case .student: return "graduationcap.fill"
        case .resident: return "stethoscope"
        case .physician: return "cross.case.fill"
        }
    }
}

// MARK: - Institution Model
struct Institution: Identifiable {
    let id = UUID()
    let name: String
    let location: String
    let icon: String
    let color: String
}

let sampleInstitutions: [Institution] = [
    Institution(name: "Toronto General Hospital", location: "Toronto, ON", icon: "building.2.fill", color: "4ADE80"),
    Institution(name: "McGill University Health Centre", location: "Montreal, QC", icon: "graduationcap.fill", color: "22C55E"),
    Institution(name: "Vancouver General Hospital", location: "Vancouver, BC", icon: "cross.fill", color: "16A34A"),
    Institution(name: "The Ottawa Hospital", location: "Ottawa, ON", icon: "heart.fill", color: "15803D"),
    Institution(name: "Kingston Health Sciences Centre", location: "Kingston, ON", icon: "building.columns.fill", color: "166534"),
    Institution(name: "Sunnybrook Health Sciences Centre", location: "Toronto, ON", icon: "sun.max.fill", color: "4ADE80"),
    Institution(name: "Queen's University School of Medicine", location: "Kingston, ON", icon: "graduationcap.fill", color: "22C55E"),
    Institution(name: "University of Toronto Medicine", location: "Toronto, ON", icon: "book.fill", color: "16A34A")
]

// MARK: - Wellness Activity
struct WellnessActivity: Identifiable {
    let id = UUID()
    let title: String
    let category: ActivityCategory
    let duration: Int // in minutes
    let imageUrl: String
    let steps: [ActivityStep]
}

enum ActivityCategory: String, CaseIterable {
    case focus = "FOCUS"
    case physical = "PHYSICAL"
    case mindfulness = "MINDFULNESS"
    case recovery = "RECOVERY"
    
    var color: String {
        switch self {
        case .focus: return "4ADE80"
        case .physical: return "3B82F6"
        case .mindfulness: return "A855F7"
        case .recovery: return "F59E0B"
        }
    }
}

struct ActivityStep: Identifiable {
    let id = UUID()
    let name: String
    let subtitle: String
    let description: String
    let durationSeconds: Int
}

let sampleActivities: [WellnessActivity] = [
    WellnessActivity(
        title: "5-min Breathing",
        category: .focus,
        duration: 5,
        imageUrl: "breathing",
        steps: [
            ActivityStep(name: "Prepare", subtitle: "Get Comfortable", description: "Find a quiet space and sit comfortably. Close your eyes gently.", durationSeconds: 30),
            ActivityStep(name: "Box Breathing", subtitle: "4-4-4-4", description: "Inhale for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat.", durationSeconds: 60),
            ActivityStep(name: "Deep Breathing", subtitle: "Belly Breaths", description: "Place hand on belly. Breathe deeply into your diaphragm.", durationSeconds: 90),
            ActivityStep(name: "Release", subtitle: "Let Go", description: "Allow your breathing to return to normal. Notice how you feel.", durationSeconds: 45)
        ]
    ),
    WellnessActivity(
        title: "Quick Stretching",
        category: .physical,
        duration: 8,
        imageUrl: "stretching",
        steps: [
            ActivityStep(name: "Neck Rolls", subtitle: "Release Tension", description: "Gently roll your head in circles, 5 times each direction.", durationSeconds: 45),
            ActivityStep(name: "Shoulder Shrugs", subtitle: "Open Chest", description: "Raise shoulders to ears, hold 3 seconds, release. Repeat 8 times.", durationSeconds: 40),
            ActivityStep(name: "Mountain Pose", subtitle: "Tadasana", description: "Stand with feet together, arms at your sides. Ground your feet firmly into the earth and lengthen your spine. Inhale deeply, lifting your chest while keeping shoulders relaxed and away from your ears.", durationSeconds: 45),
            ActivityStep(name: "Forward Fold", subtitle: "Uttanasana", description: "Exhale and fold forward from hips. Let head hang heavy.", durationSeconds: 60),
            ActivityStep(name: "Cat-Cow", subtitle: "Spinal Flow", description: "On hands and knees, alternate between arching and rounding spine.", durationSeconds: 60),
            ActivityStep(name: "Child's Pose", subtitle: "Rest", description: "Kneel and fold forward, arms extended. Breathe deeply.", durationSeconds: 60),
            ActivityStep(name: "Seated Twist", subtitle: "Spine Reset", description: "Sit cross-legged, twist gently to each side. Hold 30 seconds each.", durationSeconds: 60),
            ActivityStep(name: "Final Rest", subtitle: "Integration", description: "Lie flat and breathe. Notice the effects of your practice.", durationSeconds: 60)
        ]
    ),
    WellnessActivity(
        title: "Rapid Reset",
        category: .mindfulness,
        duration: 3,
        imageUrl: "meditation",
        steps: [
            ActivityStep(name: "Pause", subtitle: "Stop", description: "Wherever you are, pause completely. Take one deep breath.", durationSeconds: 20),
            ActivityStep(name: "Notice", subtitle: "Observe", description: "Notice 3 things you can see right now without judgment.", durationSeconds: 40),
            ActivityStep(name: "Ground", subtitle: "Feel", description: "Feel your feet on the ground. Notice the weight of your body.", durationSeconds: 40),
            ActivityStep(name: "Breathe", subtitle: "Release", description: "Take 5 slow, deep breaths. You are present. You are capable.", durationSeconds: 80)
        ]
    )
]

// MARK: - Mood Entry
struct MoodEntry: Identifiable {
    let id = UUID()
    let date: Date
    let score: Int // 1-10
    let notes: String?
    let afterActivity: String?
}

// MARK: - Wellness Insight
struct WellnessInsight: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let highlightText: String
    let icon: String
}

// MARK: - Intervention
struct Intervention: Identifiable {
    let id = UUID()
    let name: String
    let duration: String
    let effectiveness: Double // 0-100
}

let sampleInterventions: [Intervention] = [
    Intervention(name: "Power Nap", duration: "20m", effectiveness: 85),
    Intervention(name: "Deep Breathing", duration: "5m", effectiveness: 72),
    Intervention(name: "Hydration Target", duration: "ongoing", effectiveness: 50)
]

// MARK: - Community Post
struct CommunityPost: Identifiable {
    let id = UUID()
    let category: PostCategory
    let title: String
    let author: String
    let isAnonymous: Bool
    let timeAgo: String
    let content: String
    let likes: Int
    let comments: Int
    let imageUrl: String?
}

enum PostCategory: String, CaseIterable {
    case all = "All"
    case residencyLife = "Residency Life"
    case studyTips = "Study Tips"
    case mentalHealth = "Mental Health"
    case physicalHealth = "Physical Health"
    
    var color: String {
        switch self {
        case .all: return "3B82F6"
        case .residencyLife: return "22C55E"
        case .studyTips: return "F59E0B"
        case .mentalHealth: return "A855F7"
        case .physicalHealth: return "EF4444"
        }
    }
}

let samplePosts: [CommunityPost] = [
    CommunityPost(
        category: .residencyLife,
        title: "How to handle your first 24-hour shift?",
        author: "Dr. Anonymous",
        isAnonymous: true,
        timeAgo: "2h ago",
        content: "The transition to long shifts can be daunting. Here are some strategies that helped me survive my first one...",
        likes: 24,
        comments: 12,
        imageUrl: "hospital_hallway"
    ),
    CommunityPost(
        category: .mentalHealth,
        title: "Med school burnout is hitting hard this week.",
        author: "Student Doctor",
        isAnonymous: false,
        timeAgo: "5h ago",
        content: "I feel like I'm drowning in flashcards and clinical rotations. Does anyone have tips for reclaiming...",
        likes: 156,
        comments: 48,
        imageUrl: nil
    ),
    CommunityPost(
        category: .studyTips,
        title: "Anki Deck for Step 2 CK?",
        author: "FutureMD_2025",
        isAnonymous: false,
        timeAgo: "12h ago",
        content: "Looking for the most updated deck for clinical rotations and Step 2. Is AnKing still the gold standard or is there something newer?",
        likes: 9,
        comments: 21,
        imageUrl: nil
    )
]

// MARK: - Calendar Event
struct CalendarEvent: Identifiable {
    let id = UUID()
    let title: String
    let date: Date
    let time: String
    let location: String
    let isRSVPd: Bool
    let imageUrl: String
}

let sampleEvents: [CalendarEvent] = [
    CalendarEvent(title: "Residency Wellness Workshop", date: Date(), time: "5:00 PM", location: "Main Auditorium", isRSVPd: true, imageUrl: "workshop"),
    CalendarEvent(title: "Med School Yoga Night", date: Date().addingTimeInterval(86400), time: "6:30 PM", location: "Gym Studio B", isRSVPd: false, imageUrl: "yoga"),
    CalendarEvent(title: "Burnout Prevention Seminar", date: Date().addingTimeInterval(86400 * 7), time: "12:00 PM", location: "Conf Room 4", isRSVPd: false, imageUrl: "seminar")
]

// MARK: - Grounding Exercise
struct GroundingStep: Identifiable {
    let id = UUID()
    let number: Int
    let sense: String
    let instruction: String
    let icon: String
}

let groundingSteps: [GroundingStep] = [
    GroundingStep(number: 5, sense: "See", instruction: "Find 5 objects in your surroundings", icon: "eye.fill"),
    GroundingStep(number: 4, sense: "Touch", instruction: "Acknowledge 4 things you can feel", icon: "hand.raised.fill"),
    GroundingStep(number: 3, sense: "Hear", instruction: "Identify 3 distinct sounds", icon: "ear.fill"),
    GroundingStep(number: 2, sense: "Smell", instruction: "Note 2 scents in the air", icon: "wind"),
    GroundingStep(number: 1, sense: "Taste", instruction: "Focus on 1 thing you can taste", icon: "mouth.fill")
]

// MARK: - Achievement
struct Achievement: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let icon: String
    let isUnlocked: Bool
}

let sampleAchievements: [Achievement] = [
    Achievement(title: "7-Day Streak", subtitle: "Wellness consistent", icon: "flame.fill", isUnlocked: true),
    Achievement(title: "10 Sessions", subtitle: "Mindfulness hero", icon: "star.fill", isUnlocked: true),
    Achievement(title: "First SOS", subtitle: "Self-aware", icon: "heart.fill", isUnlocked: false),
    Achievement(title: "Community Helper", subtitle: "10 helpful replies", icon: "hand.raised.fill", isUnlocked: false)
]

// MARK: - Onboarding Question
struct OnboardingQuestion {
    let title: String
    let subtitle: String
    let options: [OnboardingOption]
    let allowsMultiple: Bool
}

struct OnboardingOption: Identifiable {
    let id = UUID()
    let title: String
    let description: String
    let icon: String
}

let onboardingQuestions: [OnboardingQuestion] = [
    OnboardingQuestion(
        title: "What is your current role?",
        subtitle: "We tailor your wellness insights and burnout risk assessments based on your professional stage and unique daily challenges.",
        options: [
            OnboardingOption(title: "Medical Student", description: "Focus on study-life balance and exam stress", icon: "graduationcap.fill"),
            OnboardingOption(title: "Resident", description: "Focus on shift recovery and burnout prevention", icon: "stethoscope"),
            OnboardingOption(title: "Physician", description: "Focus on long-term wellness and sustainability", icon: "cross.case.fill")
        ],
        allowsMultiple: false
    ),
    OnboardingQuestion(
        title: "What challenges you most?",
        subtitle: "Select all that apply. This helps us personalize your interventions.",
        options: [
            OnboardingOption(title: "Long Shifts", description: "Recovery after extended hours", icon: "clock.fill"),
            OnboardingOption(title: "Exam Stress", description: "Test anxiety and studying", icon: "doc.text.fill"),
            OnboardingOption(title: "Work-Life Balance", description: "Finding time for yourself", icon: "scale.3d"),
            OnboardingOption(title: "Patient Outcomes", description: "Emotional toll of difficult cases", icon: "heart.fill"),
            OnboardingOption(title: "Imposter Syndrome", description: "Feeling inadequate", icon: "person.fill.questionmark"),
            OnboardingOption(title: "Sleep Deprivation", description: "Not getting enough rest", icon: "moon.zzz.fill")
        ],
        allowsMultiple: true
    ),
    OnboardingQuestion(
        title: "What are your wellness goals?",
        subtitle: "We'll track progress and celebrate your achievements.",
        options: [
            OnboardingOption(title: "Reduce Stress", description: "Feel calmer daily", icon: "leaf.fill"),
            OnboardingOption(title: "Better Sleep", description: "Improve rest quality", icon: "bed.double.fill"),
            OnboardingOption(title: "Build Resilience", description: "Handle pressure better", icon: "shield.fill"),
            OnboardingOption(title: "Stay Active", description: "Move more regularly", icon: "figure.walk"),
            OnboardingOption(title: "Mindfulness", description: "Be more present", icon: "brain.head.profile"),
            OnboardingOption(title: "Community", description: "Connect with peers", icon: "person.2.fill")
        ],
        allowsMultiple: true
    ),
    OnboardingQuestion(
        title: "How often can you practice?",
        subtitle: "We'll adapt our recommendations to fit your schedule.",
        options: [
            OnboardingOption(title: "Daily", description: "5-10 minutes each day", icon: "calendar.badge.clock"),
            OnboardingOption(title: "Few times weekly", description: "When I have a break", icon: "calendar"),
            OnboardingOption(title: "Weekly", description: "Dedicated wellness time", icon: "calendar.circle"),
            OnboardingOption(title: "As needed", description: "When I'm stressed", icon: "exclamationmark.triangle.fill")
        ],
        allowsMultiple: false
    )
]
