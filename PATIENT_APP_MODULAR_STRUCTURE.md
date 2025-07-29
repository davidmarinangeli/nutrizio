# Patient App - Modular Structure

## Overview
The patient app has been refactored into a modular architecture for better maintainability, reusability, and organization.

## File Structure

```
app/components/
├── patient-app.tsx              # Main entry point and view router
├── types/
│   └── patient-types.ts         # Shared TypeScript interfaces
├── hooks/
│   └── use-patient-state.ts     # Custom hook for state management
└── patient/
    ├── dashboard-view.tsx       # Today's diet plan with swipe interactions
    ├── compliance-view.tsx      # Compliance stats and achievements
    ├── weekly-view.tsx          # Weekly history and navigation
    ├── shared-components.tsx    # Reusable UI components (Header, StatsCard)
    └── food-item.tsx           # Reusable food item component
```

## Components

### 1. `patient-app.tsx` (Main Entry Point)
- **Purpose**: Routes between different views
- **Responsibilities**: View state management and component orchestration
- **Size**: ~30 lines (was 1000+ lines)

### 2. `dashboard-view.tsx` (Today's Diet)
- **Purpose**: Interactive daily meal plan
- **Features**: 
  - Horizontal swipe animations
  - Food rating system
  - Alternative food selection
  - Custom replacement form
- **Dependencies**: Uses shared hooks and components

### 3. `compliance-view.tsx` (Stats & Progress)
- **Purpose**: Shows user compliance metrics
- **Features**:
  - Weekly compliance score
  - Achievement tracking
  - Personalized suggestions
- **Focus**: Data visualization and motivation

### 4. `weekly-view.tsx` (History & Planning)
- **Purpose**: Weekly diet plan overview
- **Features**:
  - Week navigation
  - Historical data view
  - Diet plan change indicators
  - Day-by-day compliance tracking

### 5. `shared-components.tsx` (Reusable UI)
- **Components**:
  - `PatientHeader`: Consistent header with back button and theme toggle
  - `StatsCard`: Reusable card for displaying metrics
- **Benefits**: Consistent UI and reduced code duplication

### 6. `food-item.tsx` (Food Display)
- **Purpose**: Consistent food item rendering
- **Props**: Configurable for different contexts (interactive vs read-only)
- **Features**: Status indicators, ratings, tags display

## Benefits of Modular Structure

### ✅ **Maintainability**
- Each view is self-contained with focused responsibilities
- Easier to debug and modify specific features
- Clear separation of concerns

### ✅ **Reusability**
- Shared components reduce code duplication
- Common patterns abstracted into reusable hooks
- Consistent UI across all views

### ✅ **Scalability**
- Easy to add new views without modifying existing code
- Components can be independently developed/tested
- Type safety maintained across all modules

### ✅ **Performance**
- Smaller component files load faster
- Better tree-shaking opportunities
- Reduced bundle size per view

### ✅ **Developer Experience**
- Easier navigation in code editor
- Focused development on specific features
- Better IntelliSense and autocomplete

## Usage Example

```tsx
// Adding a new view is simple:
function NewPatientView({ onViewChange }: { onViewChange: (view: ViewType) => void }) {
  return (
    <div>
      <PatientHeader 
        title="New Feature" 
        onBackClick={() => onViewChange("dashboard")} 
      />
      {/* View content */}
    </div>
  )
}

// Update main router:
if (currentView === "new-feature") {
  return <NewPatientView onViewChange={handleViewChange} />
}
```

## Migration Notes

- All existing functionality preserved
- Brand integration maintained across all components
- Horizontal swipe animation working in dashboard view
- TypeScript types properly defined and shared
- Build system unchanged - everything compiles successfully

## Next Steps

1. **Testing**: Add unit tests for individual components
2. **Documentation**: Add JSDoc comments to component props
3. **Performance**: Implement lazy loading for views
4. **Accessibility**: Add ARIA labels and keyboard navigation
5. **State Management**: Consider Context API for complex state sharing
