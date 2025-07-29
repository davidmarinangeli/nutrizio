# Nutrizio Brand Colors Guide 🌱

## Color Philosophy
Our brand identity is inspired by nature, health, and fresh nutrition. The palette uses vibrant greens that evoke freshness, growth, and wellness, complemented by warm orange accents that represent energy and vitality.

## ✅ **IMPLEMENTED & READY TO USE**

The brand colors have been fully integrated into your Nutrizio app! All components now use the new nature-inspired palette.

## Integration Status ✅

### **Components Updated:**
- ✅ **Main App Selector** - Updated with brand colors and new "Brand Colors" showcase
- ✅ **Patient App Component** - All emerald/gray colors replaced with brand palette
- ✅ **Theme Toggle** - Now uses brand colors for light/dark theme icons
- ✅ **Cards & Containers** - Using tertiary colors and brand shadows
- ✅ **Progress Indicators** - Primary green for completion states
- ✅ **Statistics Cards** - Primary, accent, and secondary color system
- ✅ **Interactive States** - Brand-specific hover effects and animations
- ✅ **Brand Showcase Component** - Live demonstration of all brand colors

### **Quick Access:**
Visit your app and click the new "Brand Colors" card to see the complete brand identity in action!

## Color Hierarchy (Material Design Principles)

### 🍃 Primary Color - Fresh Leaf Green
**Usage:** Main brand actions, primary CTAs, most important buttons
- HSL: `142, 69%, 45%` (light) / `142, 69%, 55%` (dark)
- **Use for:** Main action buttons, primary navigation, key interactions
- **Classes:** `bg-primary`, `text-primary`, `border-primary`
- **Full scale:** `primary-50` to `primary-950`

### 🌿 Secondary Color - Sage Green  
**Usage:** Supporting actions, secondary CTAs, navigation highlights
- HSL: `120, 25%, 55%` (light) / `120, 25%, 45%` (dark)
- **Use for:** Secondary buttons, tabs, supporting navigation
- **Classes:** `bg-secondary`, `text-secondary`, `border-secondary`
- **Full scale:** `secondary-50` to `secondary-950`

### 🌲 Tertiary Color - Forest Green
**Usage:** Container backgrounds, cards, subtle surfaces
- HSL: `158, 35%, 65%` (light) / `158, 35%, 35%` (dark)
- **Use for:** Card backgrounds, section containers, subtle surfaces
- **Classes:** `bg-tertiary`, `text-tertiary`, `border-tertiary`
- **Full scale:** `tertiary-50` to `tertiary-950`

### 🔥 Accent Color - Warm Orange
**Usage:** Highlights, notifications, badges, small details
- HSL: `33, 100%, 50%` (light) / `33, 100%, 60%` (dark)
- **Use for:** Status badges, notifications, highlights, small accents
- **Classes:** `bg-accent`, `text-accent`, `border-accent`
- **Full scale:** `accent-50` to `accent-950`

## Usage Examples

### Correct Hierarchy Usage ✅

```jsx
// Primary: Main action
<Button className="bg-primary hover:bg-primary-600">
  Create Diet Plan
</Button>

// Secondary: Supporting action  
<Button className="bg-secondary hover:bg-secondary-600">
  Save Draft
</Button>

// Tertiary: Container/background
<Card className="bg-tertiary-50 border-tertiary-200">
  <CardContent>...</CardContent>
</Card>

// Accent: Notification/highlight
<Badge className="bg-accent text-accent-foreground">
  New Feature!
</Badge>
```

### Brand Utility Classes

### Direct Color Classes
```css
/* Basic brand colors */
.bg-brand-primary     /* Uses --primary variable */
.bg-brand-secondary   /* Uses --secondary variable */  
.bg-brand-tertiary    /* Uses --tertiary variable */
.bg-brand-accent      /* Uses --accent variable */

/* Text colors */
.text-brand-primary, .text-brand-secondary, .text-brand-tertiary, .text-brand-accent

/* Border colors */
.border-brand-primary, .border-brand-secondary, .border-brand-tertiary, .border-brand-accent
```

### Brand Gradients
```css
.bg-brand-gradient         /* Primary to secondary gradient */
.bg-brand-accent-gradient  /* Accent to primary gradient */
.bg-brand-nature-gradient  /* Three-color nature blend */
```

### Brand Effects & Shadows
```css
.shadow-brand-primary      /* Primary color shadow */
.shadow-brand-glow         /* Multi-color brand glow */
.shadow-brand-accent       /* Accent color shadow */
.hover-brand-primary       /* Hover state with primary */
.hover-brand-glow          /* Hover with glow effect */
```

### Brand Animations
```css
.animate-brand-glow        /* Continuous brand glow animation */
.animate-brand-loading     /* Loading animation with brand colors */
.animate-accent-pulse      /* Accent color pulse effect */
.animate-pulse-glow        /* Primary color pulse */
```

## Color Accessibility

- All color combinations meet WCAG AA contrast requirements
- Dark mode automatically adjusts for optimal readability
- Each color has appropriate foreground pairings defined

## Theme Variables

The colors automatically adapt between light and dark themes using CSS custom properties:

### Light Theme
- Background: Very light green (`142, 76%, 98%`)
- Primary: Fresh leaf green (`142, 69%, 45%`)
- Text: Dark green (`142, 69%, 12%`)

### Dark Theme  
- Background: Very dark green (`142, 69%, 8%`)
- Primary: Brighter leaf green (`142, 69%, 55%`)
- Text: Light green (`142, 76%, 96%`)

## Don't Mix Randomly! ⚠️

- Don't use accent for large surfaces (only for highlights)
- Don't use tertiary for important actions (use primary/secondary)
- Follow the hierarchy: Primary > Secondary > Tertiary > Accent
- Maintain consistency across the app

## Integration with Existing Components

All shadcn/ui components will automatically use these colors through the CSS variables. No changes needed to existing component code - they'll pick up the new brand colors automatically!
