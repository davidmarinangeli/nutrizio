import type { Config } from "tailwindcss"

// all in fixtures is set to tailwind v3 as interims solutions
const { fontFamily } = require("tailwindcss/defaultTheme")

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-lexend)", ...fontFamily.sans],
        lexend: ["var(--font-lexend)", ...fontFamily.sans],
      },
      fontSize: {
        // Material Expressive UI Typography Scale with Lexend
        'display-large': ['57px', { lineHeight: '64px', fontWeight: '400', letterSpacing: '-0.25px' }],
        'display-medium': ['45px', { lineHeight: '52px', fontWeight: '400', letterSpacing: '0px' }],
        'display-small': ['36px', { lineHeight: '44px', fontWeight: '400', letterSpacing: '0px' }],
        
        'headline-large': ['32px', { lineHeight: '40px', fontWeight: '500', letterSpacing: '0px' }],
        'headline-medium': ['28px', { lineHeight: '36px', fontWeight: '500', letterSpacing: '0px' }],
        'headline-small': ['24px', { lineHeight: '32px', fontWeight: '500', letterSpacing: '0px' }],
        
        'title-large': ['22px', { lineHeight: '28px', fontWeight: '600', letterSpacing: '0px' }],
        'title-medium': ['16px', { lineHeight: '24px', fontWeight: '600', letterSpacing: '0.15px' }],
        'title-small': ['14px', { lineHeight: '20px', fontWeight: '600', letterSpacing: '0.1px' }],
        
        'label-large': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '0.1px' }],
        'label-medium': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.5px' }],
        'label-small': ['11px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.5px' }],
        
        'body-large': ['16px', { lineHeight: '24px', fontWeight: '400', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', fontWeight: '400', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', fontWeight: '400', letterSpacing: '0.4px' }],
      },
      fontWeight: {
        // Lexend weight hierarchy for Material Expressive UI
        'light': '300',      // For large display text
        'normal': '400',     // Body text, display text
        'medium': '500',     // Headlines, labels, emphasis
        'semibold': '600',   // Titles, important actions
        'bold': '700',       // Strong emphasis
        'extrabold': '800',  // Hero elements, major CTAs
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        // Brand Color System - Nature & Health Inspired
        primary: {
          DEFAULT: "hsl(var(--primary))", // Fresh Leaf Green - Main brand color
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(142, 76%, 96%)",   // Very light green
          100: "hsl(142, 76%, 91%)",  // Light green
          200: "hsl(142, 69%, 82%)",  // Lighter green
          300: "hsl(142, 69%, 70%)",  // Light-medium green
          400: "hsl(142, 69%, 58%)",  // Medium green
          500: "#24c25eff",  // Base primary green
          600: "hsl(142, 69%, 36%)",  // Darker green
          700: "#177d3cff",  // Dark green
          800: "#136732ff",  // Very dark green
          900: "#10562aff",  // Darkest green
          950: "hsl(142, 69%, 12%)",  // Ultra dark green
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Sage Green - Supporting brand color
          foreground: "hsl(var(--secondary-foreground))",
          50: "hsl(120, 25%, 96%)",   // Very light sage
          100: "hsl(120, 25%, 91%)",  // Light sage
          200: "hsl(120, 25%, 82%)",  // Lighter sage
          300: "hsl(120, 25%, 70%)",  // Light-medium sage
          400: "hsl(120, 25%, 58%)",  // Medium sage
          500: "#568f56ff",  // Base secondary sage
          600: "hsl(120, 25%, 36%)",  // Darker sage
          700: "hsl(120, 25%, 29%)",  // Dark sage
          800: "#2e4d2eff",  // Very dark sage
          900: "hsl(120, 25%, 20%)",  // Darkest sage
          950: "hsl(120, 25%, 12%)",  // Ultra dark sage
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))", // Forest Green - Background/surface color
          foreground: "hsl(var(--tertiary-foreground))",
          50: "hsl(158, 35%, 96%)",   // Very light forest
          100: "#e0f0eaff",  // Light forest
          200: "hsl(158, 35%, 82%)",  // Lighter forest
          300: "#98cdbaff",  // Light-medium forest
          400: "hsl(158, 35%, 58%)",  // Medium forest
          500: "#4b9b7dff",  // Base tertiary forest
          600: "hsl(158, 35%, 36%)",  // Darker forest
          700: "hsl(158, 35%, 29%)",  // Dark forest
          800: "hsl(158, 35%, 24%)",  // Very dark forest
          900: "hsl(158, 35%, 20%)",  // Darkest forest
          950: "hsl(158, 35%, 12%)",  // Ultra dark forest
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // Warm Orange - Accent color for energy
          foreground: "hsl(var(--accent-foreground))",
          50: "hsl(33, 100%, 96%)",   // Very light orange
          100: "hsl(33, 100%, 91%)",  // Light orange
          200: "hsl(33, 100%, 82%)",  // Lighter orange
          300: "hsl(33, 100%, 70%)",  // Light-medium orange
          400: "#ff9f29ff",  // Medium orange
          500: "#ff8c00ff",  // Base accent orange
          600: "#d67600ff",  // Darker orange
          700: "#b36200ff",  // Dark orange
          800: "hsl(33, 100%, 30%)",  // Very dark orange
          900: "hsl(33, 100%, 25%)",  // Darkest orange
          950: "hsl(33, 100%, 15%)",  // Ultra dark orange
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-left": {
          "0%": {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "bounce-gentle": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-2px)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--primary))",
          },
          "50%": {
            boxShadow: "0 0 30px hsl(var(--primary)), 0 0 50px hsl(var(--primary))",
          },
        },
        "brand-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--secondary))",
            transform: "scale(1)",
          },
          "50%": {
            boxShadow: "0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--secondary))",
            transform: "scale(1.02)",
          },
        },
        "brand-loading": {
          "0%": {
            boxShadow: "0 0 20px hsl(var(--primary))",
            backgroundPosition: "-200% 0",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--primary)), 0 0 20px hsl(var(--accent))",
          },
          "100%": {
            boxShadow: "0 0 20px hsl(var(--primary))",
            backgroundPosition: "200% 0",
          },
        },
        "accent-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 15px hsl(var(--accent))",
            opacity: "1",
          },
          "50%": {
            boxShadow: "0 0 25px hsl(var(--accent)), 0 0 35px hsl(var(--accent))",
            opacity: "0.8",
          },
        },
        "gradient-shift": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
        "ai-pulse": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.5",
          },
        },
        "ai-spin": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "fade-in-down": "fade-in-down 0.5s ease-out forwards",
        "fade-in-left": "fade-in-left 0.5s ease-out forwards",
        "fade-in-right": "fade-in-right 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "bounce-gentle": "bounce-gentle 2s infinite",
        "pulse-glow": "pulse-glow 4s infinite",
        "brand-glow": "brand-glow 2s infinite ease-in-out",
        "brand-loading": "brand-loading 3s infinite linear",
        "gradient-shift": "gradient-shift 3s infinite ease-in-out",
        "accent-pulse": "accent-pulse 3s infinite ease-in-out",
        "ai-pulse": "ai-pulse 5s infinite ease-in-out",
        "ai-spin": "ai-spin 2s infinite linear",
      },
      boxShadow: {
        glow: "0 0 20px hsl(var(--primary))",
        "brand-primary": "0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.3)",
        "brand-secondary": "0 0 20px hsl(var(--secondary)), 0 0 40px hsl(var(--secondary) / 0.3)",
        "brand-accent": "0 0 20px hsl(var(--accent)), 0 0 40px hsl(var(--accent) / 0.3)",
        "brand-gradient": "0 0 30px hsl(var(--primary)), 0 0 60px hsl(var(--secondary))",
        "brand-soft": "0 0 15px hsl(var(--primary) / 0.2)",
        // Keep legacy for backward compatibility
        "ai-blue": "0 0 20px theme(colors.blue.400), 0 0 40px theme(colors.blue.200)",
        "ai-emerald": "0 0 20px theme(colors.emerald.400), 0 0 40px theme(colors.emerald.200)",
        "ai-gradient": "0 0 30px theme(colors.blue.400), 0 0 60px theme(colors.emerald.400)",
      },
      backgroundSize: {
        'auto': 'auto',
        'cover': 'cover',
        'contain': 'contain',
        '200': '200%',
        '300': '300%',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
