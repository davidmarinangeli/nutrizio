"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Leaf, Sparkles, Heart, TrendingUp, ChevronLeft, Home } from "lucide-react"

interface BrandShowcaseProps {
  onBack?: () => void
}

export default function BrandShowcase({ onBack }: BrandShowcaseProps) {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* Header with Back Button */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onBack?.()}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand-primary transition-all hover:shadow-brand-glow"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="border-tertiary-200 hover:bg-primary-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Nutrizio Brand Identity 🌱
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience our nature-inspired color palette designed for health and nutrition
          </p>
        </div>
      </div>

      {/* Color Palette Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Primary Color */}
        <Card className="border-primary/20 hover-brand-glow">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-2 shadow-brand-primary" />
            <CardTitle className="text-primary">Primary</CardTitle>
            <CardDescription>Fresh Leaf Green</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Main Action
            </Button>
            <div className="flex space-x-1">
              <div className="w-8 h-8 bg-primary-100 rounded" />
              <div className="w-8 h-8 bg-primary-300 rounded" />
              <div className="w-8 h-8 bg-primary-500 rounded" />
              <div className="w-8 h-8 bg-primary-700 rounded" />
              <div className="w-8 h-8 bg-primary-900 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Secondary Color */}
        <Card className="border-secondary/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-2" />
            <CardTitle className="text-secondary">Secondary</CardTitle>
            <CardDescription>Sage Green</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="secondary" className="w-full">
              Support Action
            </Button>
            <div className="flex space-x-1">
              <div className="w-8 h-8 bg-secondary-100 rounded" />
              <div className="w-8 h-8 bg-secondary-300 rounded" />
              <div className="w-8 h-8 bg-secondary-500 rounded" />
              <div className="w-8 h-8 bg-secondary-700 rounded" />
              <div className="w-8 h-8 bg-secondary-900 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Tertiary Color */}
        <Card className="border-tertiary/20 bg-tertiary-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-tertiary rounded-full mx-auto mb-2" />
            <CardTitle className="text-tertiary">Tertiary</CardTitle>
            <CardDescription>Forest Green</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full border-tertiary text-tertiary">
              Container
            </Button>
            <div className="flex space-x-1">
              <div className="w-8 h-8 bg-tertiary-100 rounded" />
              <div className="w-8 h-8 bg-tertiary-300 rounded" />
              <div className="w-8 h-8 bg-tertiary-500 rounded" />
              <div className="w-8 h-8 bg-tertiary-700 rounded" />
              <div className="w-8 h-8 bg-tertiary-900 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Accent Color */}
        <Card className="border-accent/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-2 shadow-brand-accent animate-accent-pulse" />
            <CardTitle className="text-accent">Accent</CardTitle>
            <CardDescription>Warm Orange</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge className="w-full justify-center bg-accent text-accent-foreground">
              Highlight
            </Badge>
            <div className="flex space-x-1">
              <div className="w-8 h-8 bg-accent-100 rounded" />
              <div className="w-8 h-8 bg-accent-300 rounded" />
              <div className="w-8 h-8 bg-accent-500 rounded" />
              <div className="w-8 h-8 bg-accent-700 rounded" />
              <div className="w-8 h-8 bg-accent-900 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Correct Hierarchy */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              Correct Usage Example
            </CardTitle>
            <CardDescription>Following Material Design hierarchy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Diet Plan (Primary)
              </Button>
              <Button variant="secondary" className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                Save Draft (Secondary)
              </Button>
              <div className="bg-tertiary-50 p-4 rounded-lg border-tertiary-200 border">
                <p className="text-tertiary-700 text-sm">
                  This container uses tertiary colors for background surfaces
                </p>
                <Badge className="mt-2 bg-accent text-accent-foreground">
                  New Feature!
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gradient Examples */}
        <Card className="bg-brand-gradient text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              Brand Gradients
            </CardTitle>
            <CardDescription className="text-white/80">
              Nature-inspired gradient combinations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-brand-accent-gradient p-4 rounded-lg">
              <p className="text-white font-medium">Accent Gradient</p>
              <p className="text-white/90 text-sm">Orange to Green energy flow</p>
            </div>
            <div className="bg-brand-nature-gradient p-4 rounded-lg">
              <p className="text-white font-medium">Nature Gradient</p>
              <p className="text-white/90 text-sm">Three-color nature blend</p>
            </div>
            <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
              Call to Action on Gradient
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Animations Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Animations</CardTitle>
          <CardDescription>Interactive effects using brand colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="animate-brand-glow">
              Brand Glow Effect
            </Button>
            <Button className="animate-pulse-glow">
              Pulse Glow
            </Button>
            <Button className="bg-accent hover-brand-glow">
              Hover Brand Glow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Access Information */}
      <Card className="bg-tertiary-50 border-tertiary-200">
        <CardHeader>
          <CardTitle className="text-tertiary">🔗 Direct Access</CardTitle>
          <CardDescription>
            You can access this brand showcase page directly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>URL:</strong> <code className="bg-muted px-2 py-1 rounded text-xs">/brand</code>
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>From Main App:</strong> Click the "Brand Colors" card on the home page
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Navigation:</strong> Use the back button or Home button to return
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
