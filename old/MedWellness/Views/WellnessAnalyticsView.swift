import SwiftUI

struct WellnessAnalyticsView: View {
    @State private var selectedTimeRange = 0
    let timeRanges = ["1W", "1M", "3M"]
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Time Range Picker
                        timeRangePicker
                        
                        // Stress Trend Card
                        stressTrendCard
                        
                        // Insight Card
                        insightCard
                        
                        // Most Effective Interventions
                        interventionsCard
                        
                        // Security Footer
                        securityFooter
                        
                        Spacer(minLength: 120)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                }
            }
            .navigationTitle("Wellness Analytics")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {}) {
                        Image(systemName: "person.crop.circle")
                            .foregroundColor(.appAccent)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "bell.fill")
                            .foregroundColor(.appTextSecondary)
                    }
                }
            }
        }
    }
    
    private var timeRangePicker: some View {
        HStack(spacing: 0) {
            ForEach(0..<timeRanges.count, id: \.self) { index in
                Button(action: {
                    withAnimation {
                        selectedTimeRange = index
                    }
                }) {
                    Text(timeRanges[index])
                        .font(.appCaption)
                        .foregroundColor(selectedTimeRange == index ? .white : .appTextMuted)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(selectedTimeRange == index ? Color.appCardBackground : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
        }
        .padding(4)
        .background(Color.appCardBorder.opacity(0.3))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
    
    private var stressTrendCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Weekly Stress Trend")
                        .font(.appSmall)
                        .foregroundColor(.appTextMuted)
                    
                    Text("Moderate")
                        .font(.appTitle)
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: "arrow.down.right")
                    Text("12%")
                }
                .font(.appCaption)
                .foregroundColor(.appAccent)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.appAccent.opacity(0.15))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            
            // Chart
            StressLineChart()
                .frame(height: 180)
            
            // Day Labels
            HStack {
                ForEach(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"], id: \.self) { day in
                    Text(day)
                        .font(.system(size: 10))
                        .foregroundColor(.appTextMuted)
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(20)
        .appCard()
    }
    
    private var insightCard: some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                Circle()
                    .fill(Color(hex: "F59E0B").opacity(0.2))
                    .frame(width: 40, height: 40)
                
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(Color(hex: "F59E0B"))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Insight:")
                    .font(.appSubheadline)
                    .foregroundColor(.white) +
                Text(" Your stress peaked during your 24h shift on Tuesday. Using ")
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary) +
                Text("Power Naps")
                    .font(.appBody)
                    .foregroundColor(.appAccent) +
                Text(" helped recover your baseline by 15%.")
                    .font(.appBody)
                    .foregroundColor(.appTextSecondary)
            }
        }
        .padding(20)
        .background(Color.appCardBackground.opacity(0.5))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    private var interventionsCard: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Most Effective Interventions")
                .font(.appHeadline)
                .foregroundColor(.white)
            
            VStack(spacing: 16) {
                HStack {
                    Text("Intervention Success")
                        .font(.appSmall)
                        .foregroundColor(.appTextMuted)
                    
                    Spacer()
                    
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("+8% efficiency")
                            .font(.appCaption)
                            .foregroundColor(.appAccent)
                        
                        Text("All Time")
                            .font(.appSmall)
                            .foregroundColor(.appTextMuted)
                    }
                }
                
                Text("Top 3 Performed")
                    .font(.appHeadline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                ForEach(sampleInterventions) { intervention in
                    InterventionRow(intervention: intervention)
                }
            }
            .padding(20)
            .appCard()
        }
    }
    
    private var securityFooter: some View {
        HStack(spacing: 8) {
            Image(systemName: "lock.fill")
                .font(.system(size: 12))
            
            Text("End-to-end encrypted medical data")
                .font(.appSmall)
        }
        .foregroundColor(.appTextMuted)
    }
}

struct StressLineChart: View {
    let points: [CGFloat] = [0.5, 0.4, 0.65, 0.55, 0.3, 0.45, 0.2]
    
    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            let stepX = width / CGFloat(points.count - 1)
            
            ZStack {
                // Grid lines
                ForEach(0..<4) { i in
                    let y = height * CGFloat(i) / 3
                    Path { path in
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: width, y: y))
                    }
                    .stroke(Color.appCardBorder.opacity(0.3), lineWidth: 1)
                }
                
                // Line chart
                Path { path in
                    for (index, point) in points.enumerated() {
                        let x = CGFloat(index) * stepX
                        let y = height - (point * height)
                        
                        if index == 0 {
                            path.move(to: CGPoint(x: x, y: y))
                        } else {
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                    }
                }
                .stroke(
                    Color.appAccent,
                    style: StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round)
                )
                
                // Data points
                ForEach(0..<points.count, id: \.self) { index in
                    let x = CGFloat(index) * stepX
                    let y = height - (points[index] * height)
                    
                    Circle()
                        .fill(Color.appAccent)
                        .frame(width: 10, height: 10)
                        .position(x: x, y: y)
                }
            }
        }
    }
}

struct InterventionRow: View {
    let intervention: Intervention
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text("\(intervention.name) (\(intervention.duration))")
                    .font(.appBody)
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("\(Int(intervention.effectiveness))% effective")
                    .font(.appCaption)
                    .foregroundColor(.appAccent)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.appCardBorder)
                        .frame(height: 8)
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.appAccent)
                        .frame(width: geometry.size.width * intervention.effectiveness / 100, height: 8)
                }
            }
            .frame(height: 8)
        }
    }
}

#Preview {
    WellnessAnalyticsView()
}
