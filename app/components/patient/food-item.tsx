import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Star, Check, X } from "lucide-react"
import type { MealItem } from "../types/patient-types"

interface FoodItemProps {
  item: MealItem
  showActions?: boolean
  showStatus?: boolean
  isHistoricalView?: boolean
  className?: string
}

export function FoodItem({ 
  item, 
  showActions = false, 
  showStatus = true, 
  isHistoricalView = false,
  className = ""
}: FoodItemProps) {
  return (
    <div 
      className={`relative w-full bg-muted/50 rounded-2xl p-4 transition-all duration-300 ${
        item.completed
          ? "bg-primary/10 border-2 border-primary/20 shadow-brand-soft"
          : ""
      } ${className}`}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-foreground">
              {item.name}
            </span>
            {item.completed && item.rating && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${
                      i < item.rating! 
                        ? "fill-accent text-accent" 
                        : "text-muted-foreground"
                    }`} 
                  />
                ))}
              </div>
            )}
          </div>
          <div className="text-sm text-secondary-foreground mb-1">
            {item.quantity}
          </div>
          <div className="text-xs text-muted-foreground">
            {item.calories} kcal
          </div>
          
          {/* Tags if reviewed */}
          {item.completed && item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  className="bg-secondary-100 text-secondary-700 text-xs rounded-full px-2 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Status indicators */}
        {showStatus && (
          <div className="flex flex-col items-end gap-2">
            {item.completed ? (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-xs text-primary font-medium">
                  Completato
                </span>
              </div>
            ) : isHistoricalView ? (
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 text-destructive" />
                <span className="text-xs text-destructive font-medium">
                  Non consumato
                </span>
              </div>
            ) : (
              <Badge className="bg-tertiary-100 text-tertiary-700 border-tertiary-300 text-xs">
                Da consumare
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
