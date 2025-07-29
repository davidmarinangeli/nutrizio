import type React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import type { ViewType } from "../types/patient-types"

interface HeaderProps {
  title: string
  onBackClick?: () => void
  showThemeToggle?: boolean
  showBackButton?: boolean
  className?: string
  children?: React.ReactNode
}

export function PatientHeader({ 
  title, 
  onBackClick, 
  showThemeToggle = true, 
  showBackButton = true,
  className = "",
  children
}: HeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className={`w-full bg-card/80 backdrop-blur-lg sticky top-0 z-10 p-4 md:p-6 rounded-b-3xl shadow-brand-primary border-b border-border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {showBackButton && onBackClick ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackClick}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand-primary transition-all hover:shadow-brand-glow"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="w-10" /> // Spacer
        )}
        
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          {title}
        </h1>
        
        <div className="flex items-center gap-2">
          {children}
          {showThemeToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full bg-muted hover:bg-muted/80 shadow-brand-soft"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-accent" />
              ) : (
                <Moon className="h-5 w-5 text-secondary" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatsCardProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  variant?: "primary" | "secondary" | "accent" | "default"
  className?: string
}

export function StatsCard({ value, label, icon, variant = "default", className = "" }: StatsCardProps) {
  const variantClasses = {
    primary: "bg-primary/10 border-primary/20 text-primary",
    secondary: "bg-secondary-50 border-secondary-200 text-secondary",
    accent: "bg-accent-50 border-accent-200 text-accent",
    default: "bg-card border-border text-foreground"
  }

  return (
    <div className={`rounded-lg p-2 border ${variantClasses[variant]} ${className}`}>
      <div className="text-center">
        {icon && <div className="flex justify-center mb-2">{icon}</div>}
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
