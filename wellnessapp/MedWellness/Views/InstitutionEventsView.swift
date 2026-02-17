import SwiftUI

struct InstitutionEventsView: View {
    @State private var selectedDate = Date()
    @State private var currentMonth = Date()
    
    private let calendar = Calendar.current
    private let daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color.appBackground
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Calendar
                        calendarCard
                        
                        // Upcoming Events
                        VStack(alignment: .leading, spacing: 16) {
                            HStack {
                                Text("Upcoming Events")
                                    .font(.appHeadline)
                                    .foregroundColor(.white)
                                
                                Spacer()
                                
                                Button("See all") {}
                                    .font(.appCaption)
                                    .foregroundColor(.appAccent)
                            }
                            
                            ForEach(sampleEvents) { event in
                                EventCard(event: event)
                            }
                        }
                        
                        Spacer(minLength: 100)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                }
            }
            .navigationTitle("Institution Events")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {}) {
                        Image(systemName: "bell.fill")
                            .foregroundColor(.appTextSecondary)
                    }
                }
            }
        }
    }
    
    private var calendarCard: some View {
        VStack(spacing: 16) {
            // Month Navigation
            HStack {
                Button(action: previousMonth) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.appTextMuted)
                }
                
                Spacer()
                
                Text(monthYearString)
                    .font(.appSubheadline)
                    .foregroundColor(.white)
                
                Spacer()
                
                Button(action: nextMonth) {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.appTextMuted)
                }
            }
            
            // Day headers
            HStack {
                ForEach(daysOfWeek, id: \.self) { day in
                    Text(day)
                        .font(.appSmall)
                        .foregroundColor(.appTextMuted)
                        .frame(maxWidth: .infinity)
                }
            }
            
            // Calendar Grid
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 8) {
                ForEach(daysInMonth, id: \.self) { date in
                    if let date = date {
                        DayCell(
                            date: date,
                            isSelected: calendar.isDate(date, inSameDayAs: selectedDate),
                            isToday: calendar.isDateInToday(date),
                            hasEvent: hasEvent(on: date)
                        )
                        .onTapGesture {
                            selectedDate = date
                        }
                    } else {
                        Text("")
                            .frame(width: 36, height: 36)
                    }
                }
            }
        }
        .padding(20)
        .appCard()
    }
    
    private var monthYearString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: currentMonth)
    }
    
    private var daysInMonth: [Date?] {
        let range = calendar.range(of: .day, in: .month, for: currentMonth)!
        let firstDay = calendar.date(from: calendar.dateComponents([.year, .month], from: currentMonth))!
        let firstWeekday = calendar.component(.weekday, from: firstDay) - 1
        
        var days: [Date?] = Array(repeating: nil, count: firstWeekday)
        
        for day in range {
            if let date = calendar.date(byAdding: .day, value: day - 1, to: firstDay) {
                days.append(date)
            }
        }
        
        return days
    }
    
    private func hasEvent(on date: Date) -> Bool {
        sampleEvents.contains { event in
            calendar.isDate(event.date, inSameDayAs: date)
        }
    }
    
    private func previousMonth() {
        currentMonth = calendar.date(byAdding: .month, value: -1, to: currentMonth) ?? currentMonth
    }
    
    private func nextMonth() {
        currentMonth = calendar.date(byAdding: .month, value: 1, to: currentMonth) ?? currentMonth
    }
}

struct DayCell: View {
    let date: Date
    let isSelected: Bool
    let isToday: Bool
    let hasEvent: Bool
    
    private let calendar = Calendar.current
    
    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                if isSelected {
                    Circle()
                        .fill(Color.appAccent)
                        .frame(width: 36, height: 36)
                }
                
                Text("\(calendar.component(.day, from: date))")
                    .font(.appCaption)
                    .foregroundColor(isSelected ? .black : (isToday ? .appAccent : .white))
            }
            
            if hasEvent {
                Circle()
                    .fill(Color.appAccent)
                    .frame(width: 4, height: 4)
            }
        }
        .frame(height: 44)
    }
}

struct EventCard: View {
    let event: CalendarEvent
    
    var body: some View {
        HStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                // Date label
                Text(dateLabel)
                    .font(.appSmall)
                    .foregroundColor(.appAccent)
                    .tracking(1)
                
                Text(event.title)
                    .font(.appSubheadline)
                    .foregroundColor(.white)
                
                HStack(spacing: 6) {
                    Image(systemName: "clock")
                        .font(.system(size: 12))
                    Text(event.time)
                    
                    Text("•")
                    
                    Text(event.location)
                }
                .font(.appSmall)
                .foregroundColor(.appTextSecondary)
                
                // RSVP Button
                Button(action: {}) {
                    HStack(spacing: 6) {
                        Text("RSVP")
                        Image(systemName: event.isRSVPd ? "checkmark" : "calendar.badge.plus")
                    }
                    .font(.appCaption)
                    .foregroundColor(event.isRSVPd ? .black : .white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(event.isRSVPd ? Color.appAccent : Color.appCardBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(event.isRSVPd ? Color.clear : Color.appCardBorder, lineWidth: 1)
                    )
                }
            }
            
            Spacer()
            
            // Event image placeholder
            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.appCardBorder)
                    .frame(width: 90, height: 90)
                
                Image(systemName: "person.3.fill")
                    .font(.system(size: 28))
                    .foregroundColor(.appTextMuted)
            }
        }
        .padding(16)
        .appCard()
    }
    
    private var dateLabel: String {
        let calendar = Calendar.current
        if calendar.isDateInToday(event.date) {
            return "TODAY"
        } else if calendar.isDateInTomorrow(event.date) {
            return "TOMORROW"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM d, yyyy"
            return formatter.string(from: event.date).uppercased()
        }
    }
}

#Preview {
    InstitutionEventsView()
}
