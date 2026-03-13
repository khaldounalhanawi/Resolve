# Resolve - Product Specification

## Overview

Resolve is a mobile application designed to help users track and analyze daily metrics to discover patterns, build healthy habits, and achieve personal goals. The app provides a frictionless logging experience combined with powerful visualization and analytics tools.

## Core Concept

Users define custom metrics (weight, sleep, mood, calories, steps, etc.) and log values daily. The app then visualizes historical data through heatmaps and correlation graphs, helping users discover patterns and optimize their behavior.

## Target Users

- Health enthusiasts tracking fitness metrics
- Productivity seekers monitoring daily habits
- Anyone looking to understand patterns in their behavior
- People who want data-driven insights into their daily life

## Key Features

### 1. Daily Metric Logging

**Purpose**: Make logging data quick and effortless (under 5 seconds)

**Features**:
- Slider-based input for fast data entry
- Large tap targets optimized for mobile
- Instant feedback after saving
- Support for two aggregation types:
  - **Single Value**: Replaces previous value (e.g., weight, mood)
  - **Accumulate**: Adds to daily total (e.g., calories, steps)

**User Flow**:
1. Open app to Today screen
2. Adjust sliders for each metric
3. Tap Save
4. See confirmation with current totals

### 2. Calendar Heatmap Visualization

**Purpose**: Provide immediate visual feedback on patterns over time

**Features**:
- Monthly calendar grid view
- Color-coded cells (red → yellow → green)
- Colors represent value intensity or distance from target
- Tap any day to see detailed values
- Navigate between months
- Switch between metrics

**Value Proposition**: Users naturally want more "green days," creating motivation

### 3. Correlation Analytics

**Purpose**: Help users discover relationships between metrics

**Features**:
- Multi-line chart showing multiple metrics
- Normalized values (0-100%) for comparison
- Selectable date ranges (7, 30, 90 days)
- Toggle metrics on/off
- Track trends over time

**Insights Users Can Discover**:
- "I lose weight when I sleep more"
- "My mood improves when I exercise"
- "Calories affect my weight with a 1-day delay"

### 4. Suggested Metrics

**Purpose**: Quick setup for new users

**Pre-defined Metrics**:
1. **Weight**: 40-150 kg, target: 70 kg, single value
2. **Sleep**: 0-12 h, target: 8 h, single value
3. **Mood**: 1-5 scale, target: 5, single value
4. **Calories**: 0-5000 kcal, target: 2000 kcal, accumulate
5. **Steps**: 0-30000 steps, target: 10000 steps, accumulate

Users can create custom metrics with:
- Name
- Type (number, scale, boolean, duration)
- Unit
- Min/max range
- Target value
- Aggregation type
- Color

## User Experience Flow

### First Time User

1. Opens app → Welcome screen
2. Taps "Add Suggested Metrics"
3. Metrics are created instantly
4. Start logging immediately

### Daily Ritual

**Morning**:
1. Log overnight metrics (sleep, weight, mood)
2. See yesterday's summary
3. View 5-7 day trend on calendar

**Throughout Day**:
1. Add accumulating metrics (calories, steps)
2. Quick open → adjust slider → save → close

**Evening**:
1. Log final metrics
2. Check if goals were met
3. View heatmap for motivation

### Discovery Phase

After 2-3 weeks of data:
1. Open Analytics screen
2. Select multiple metrics
3. Look for correlations
4. Discover patterns
5. Adjust behavior based on insights

## Design Principles

### 1. Frictionless Logging
- No typing required for most inputs
- Large, obvious controls
- One-tap save per metric
- Immediate feedback

### 2. Instant Gratification
- Show results immediately after logging
- Visual progress indicators
- Celebrate milestones
- Make data beautiful

### 3. Pattern Discovery
- Make patterns obvious through color
- Encourage exploration
- Provide "aha moment" insights
- Connect behavior to outcomes

### 4. Flexibility
- Users define their own metrics
- Customizable ranges and targets
- Adapt to different use cases
- Support both quantitative and qualitative tracking

## Technical Highlights

### Aggregation Logic

**Single Value Metrics**:
```
// User logs 78.5 kg for weight today
// Later logs 78.2 kg for same day
// Result: 78.2 kg (replaces previous)
```

**Accumulate Metrics**:
```
// User logs 450 kcal for calories (breakfast)
// Later logs 680 kcal (lunch)
// Later logs 520 kcal (dinner)
// Result: 1650 kcal total for the day
```

### Color Mapping

**With Target**:
- Green: Close to target (within 10%)
- Yellow: Moderate distance (10-30%)
- Red: Far from target (>30%)

**Without Target**:
- Green: High values
- Yellow: Medium values
- Red: Low values

## Future Enhancements

### Phase 1 (Current)
- ✅ Daily logging
- ✅ Calendar heatmap
- ✅ Correlation graphs
- ✅ Suggested metrics

### Phase 2 (Near Future)
- Push notifications for daily reminders
- Streak tracking and badges
- Data export (CSV, PDF)
- Dark mode
- Metric notes/annotations

### Phase 3 (Future)
- AI-powered insights
- Pattern prediction
- Goal recommendations
- Social features (optional sharing)
- Integration with health apps (Apple Health, Google Fit)

### Phase 4 (Long-term)
- Machine learning for causation detection
- Personalized coaching
- Community metrics and benchmarks
- Advanced statistical analysis

## Success Metrics

### Engagement
- Daily active users (DAU)
- Average time in app
- Logging frequency
- Streak length

### Value
- Metrics created per user
- Days with data logged
- Analytics screen usage
- User retention (7-day, 30-day)

### Growth
- New user onboarding completion
- Feature adoption rate
- Referral rate
- App store ratings

## Competitive Advantage

1. **Speed**: Logging in under 5 seconds
2. **Flexibility**: Track anything, not just predefined metrics
3. **Insights**: Correlation graphs reveal hidden patterns
4. **Design**: Beautiful, minimal interface
5. **No Account Required**: Works offline, data stored locally
6. **Free**: No paywall for core features

## Business Model

**Current**: Free with local data storage

**Future Options**:
- Premium tier for cloud sync
- Export features
- Advanced analytics
- Team/family accounts
- Professional/clinical version

## Privacy & Data

- All data stored locally by default
- No account required
- No data collection or tracking
- User owns their data
- Optional cloud backup (future)
- GDPR compliant

## Platform

- React Native + Expo
- iOS and Android
- Optimized for mobile phones
- Tablet support (future)
- Web version (future)
