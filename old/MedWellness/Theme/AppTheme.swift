import SwiftUI

// MARK: - Color Theme
extension Color {
    // Primary Colors
    static let appBackground = Color(hex: "0A1F14")
    static let appBackgroundSecondary = Color(hex: "0D2818")
    static let appCardBackground = Color(hex: "132D1B")
    static let appCardBorder = Color(hex: "1E4D2B")
    
    // Accent Colors
    static let appAccent = Color(hex: "4ADE80")
    static let appAccentSecondary = Color(hex: "22C55E")
    static let appAccentGlow = Color(hex: "4ADE80").opacity(0.3)
    
    // Text Colors
    static let appTextPrimary = Color.white
    static let appTextSecondary = Color.white.opacity(0.7)
    static let appTextMuted = Color.white.opacity(0.5)
    
    // SOS/Urgent Colors
    static let appSosBlue = Color(hex: "3B82F6")
    static let appSosBackground = Color(hex: "0F172A")
    static let appUrgentRed = Color(hex: "EF4444")
    
    // Community Colors
    static let appCommunityBlue = Color(hex: "1E3A5F")
    static let appCommunityCard = Color(hex: "1A2744")
    
    // Helper initializer
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Typography
extension Font {
    static let appTitle = Font.system(size: 28, weight: .bold, design: .rounded)
    static let appHeadline = Font.system(size: 22, weight: .semibold, design: .rounded)
    static let appSubheadline = Font.system(size: 18, weight: .medium, design: .rounded)
    static let appBody = Font.system(size: 16, weight: .regular, design: .default)
    static let appCaption = Font.system(size: 14, weight: .medium, design: .default)
    static let appSmall = Font.system(size: 12, weight: .regular, design: .default)
    static let appLarge = Font.system(size: 48, weight: .bold, design: .rounded)
}

// MARK: - Card Style Modifier
struct AppCardStyle: ViewModifier {
    var filled: Bool = false
    
    func body(content: Content) -> some View {
        content
            .background(filled ? Color.appCardBackground : Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Color.appCardBorder, lineWidth: filled ? 0 : 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

extension View {
    func appCard(filled: Bool = true) -> some View {
        modifier(AppCardStyle(filled: filled))
    }
}

// MARK: - Button Styles
struct AppPrimaryButtonStyle: ButtonStyle {
    var isEnabled: Bool = true
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.appSubheadline)
            .foregroundColor(isEnabled ? .black : .white.opacity(0.5))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(isEnabled ? Color.appAccent : Color.appCardBorder)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct AppSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.appCaption)
            .foregroundColor(.appAccent)
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .background(Color.appCardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color.appAccent, lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.98 : 1)
    }
}

// MARK: - Selection Card Style
struct SelectionCardStyle: ViewModifier {
    let isSelected: Bool
    
    func body(content: Content) -> some View {
        content
            .background(Color.appCardBackground)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? Color.appAccent : Color.appCardBorder, lineWidth: isSelected ? 2 : 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

extension View {
    func selectionCard(isSelected: Bool) -> some View {
        modifier(SelectionCardStyle(isSelected: isSelected))
    }
}
