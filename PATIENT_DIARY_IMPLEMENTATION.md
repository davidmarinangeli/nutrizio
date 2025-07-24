# Enhanced Patient Diary and History System

## Overview
This implementation adds comprehensive patient diary tracking and historical browsing capabilities to the Nutrizio application, allowing both patients and dietitians to track, review, and analyze meal plan compliance over time.

## Key Features Implemented

### 1. Enhanced Patient Weekly View (`patient-app.tsx`)
- **Week Navigation**: Patients can browse through different weeks of the year
- **Historical Mode**: Automatic detection when viewing past weeks vs current week
- **Week Statistics**: Real-time display of compliance percentage, substitutions count, and average rating
- **Diet Plan Change Indicators**: Visual alerts when diet plans have been modified
- **Contextual Display**: Different UI states for current vs historical data

### 2. Dietitian Patient History View (`patient-history-view.tsx`)
- **Monthly Calendar Heatmap**: 
  - Color-coded days based on patient engagement (number of feedbacks)
  - Visual indicators for substitutions and diet plan changes
  - Clickable days to drill down into weekly details
- **Weekly Comparison View**:
  - Side-by-side comparison of prescribed vs actual consumption
  - Detailed breakdown of patient feedback and ratings
  - Week-by-week navigation with statistics
- **Engagement Metrics**: Focus on patient interaction rather than just compliance

### 3. Database Schema (`create-diary-tables.sql`)
- **diary_entries** table: Stores daily meal consumption and feedback
- **diet_plan_versions** table: Tracks diet plan changes over time
- **Helper functions**: SQL functions for compliance calculation and data retrieval
- **Row Level Security**: Proper access control for patient data

### 4. Enhanced Patient Detail Page Integration
- **History Button**: Direct access to patient history from dietitian dashboard
- **Seamless Navigation**: Smooth transitions between different views

## Technical Implementation

### Data Structure
```typescript
interface DiaryEntry {
  id: string
  patient_id: string
  date: string
  meal_id: string
  food_item_id: string
  prescribed_food: { name: string; quantity: string; calories: number }
  actual_food: { name: string; quantity: string; calories: number; was_substituted: boolean }
  rating: number // 1-5 stars
  tags: string[]
  notes?: string
}

interface DietPlanVersion {
  id: string
  patient_id: string
  plan_data: WeeklyMealPlan
  start_date: string
  end_date?: string // null if current
  created_by: string
  reason_for_change?: string
}
```

### Key Components

#### MonthHeatmap Component
- **Engagement-based coloring**: Days colored by number of patient feedbacks
- **Multi-indicator support**: Shows substitutions, diet plan changes, and engagement levels
- **Interactive calendar**: Click any day to view detailed week breakdown

#### WeekComparisonView Component
- **Prescribed vs Actual**: Clear comparison of intended vs actual consumption
- **Detailed Feedback**: Shows ratings, tags, and notes for each meal item
- **Statistics Overview**: Weekly compliance, substitution count, and average ratings

#### Enhanced Weekly Navigation
- **Smart Date Handling**: Proper week start/end calculations
- **Historical Detection**: Automatic switching between current and historical modes
- **Diet Plan Awareness**: Visual indicators for plan changes within viewed weeks

## User Experience Features

### For Patients
- **Intuitive Navigation**: Easy browsing through their meal history
- **Visual Feedback**: Clear indicators of their progress and engagement
- **Contextual Information**: Different display modes for current vs historical data
- **Progress Tracking**: Visual representation of compliance trends

### For Dietitians
- **Engagement Overview**: Quick assessment of patient interaction levels
- **Historical Analysis**: Deep dive into patient behavior patterns
- **Plan Change Tracking**: Clear timeline of diet plan modifications
- **Actionable Insights**: Focus on patient engagement rather than just compliance

## Color Coding System

### Patient Engagement (Heatmap)
- **Gray**: No feedback (0 reviews)
- **Light Green**: Minimal engagement (1 feedback)
- **Medium Green**: Moderate engagement (2-3 feedbacks)
- **Dark Green**: High engagement (4+ feedbacks)

### Indicators
- **Orange Dots**: Substitutions made
- **Blue Dots**: Diet plan changes
- **Green Bars**: Compliance levels
- **Star Ratings**: Patient satisfaction scores

## Benefits

1. **Better Patient Engagement**: Patients can see their progress over time
2. **Improved Dietitian Insights**: Clear view of patient behavior patterns
3. **Historical Context**: Ability to analyze long-term trends
4. **Plan Effectiveness**: Understanding which diet plans work best
5. **Personalized Care**: Data-driven decisions for plan modifications

## Future Enhancements

1. **Advanced Analytics**: Trend analysis and predictive insights
2. **Export Functionality**: Generate reports for patient consultations
3. **Notification System**: Alerts for low engagement or concerning patterns
4. **Integration with Health Metrics**: Connect with weight, blood sugar, etc.
5. **AI-Powered Recommendations**: Suggest plan modifications based on patterns

This implementation provides a comprehensive foundation for tracking patient progress and engagement, enabling both patients and dietitians to make informed decisions about meal planning and dietary adherence.
