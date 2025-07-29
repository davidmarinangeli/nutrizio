"use client"

import { useRef } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { ChevronLeft, Moon, Sun, Brain, FileText, Layout, Upload, Loader2, Sparkles } from "lucide-react"

interface Step3CreationMethodProps {
  selectedCreationMethod: "ai" | "pdf" | "template" | null
  setSelectedCreationMethod: (method: "ai" | "pdf" | "template") => void
  selectedTemplate: string | null
  setSelectedTemplate: (template: string | null) => void
  uploadedFile: File | null
  setUploadedFile: (file: File | null) => void
  onNext: () => void
  onBack: () => void
  isLoading: boolean
  theme: string | undefined
  setTheme: (theme: string) => void
  // Add patient data to show summary
  patientData?: {
    name: string
    surname: string
    targetCalories: string
    mainGoal: string
    restrictions: string[]
    allergies: string[]
  }
}

export default function Step3CreationMethod({
  selectedCreationMethod,
  setSelectedCreationMethod,
  selectedTemplate,
  setSelectedTemplate,
  uploadedFile,
  setUploadedFile,
  onNext,
  onBack,
  isLoading,
  theme,
  setTheme,
  patientData
}: Step3CreationMethodProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mockTemplates = [
    { id: "template1", name: "Dieta Mediterranea Classica" },
    { id: "template2", name: "Aumento Massa Muscolare" },
    { id: "template3", name: "Detox Vegano" },
    { id: "template4", name: "Low-Carb Intensivo" },
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
    }
  }

  const canProceed = selectedCreationMethod === "ai" || 
                    (selectedCreationMethod === "template" && selectedTemplate) ||
                    (selectedCreationMethod === "pdf" && uploadedFile)

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full max-w-6xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Nuovo Paziente - Metodo di Creazione
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-muted hover:bg-muted/80"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Generation */}
          <Card 
            className={`w-full p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
              selectedCreationMethod === 'ai'
                ? "ring-2 ring-primary bg-primary/10 dark:bg-primary/20 shadow-brand-primary" 
                : "hover:shadow-lg hover:shadow-brand-secondary hover:scale-105 hover:bg-gradient-to-br hover:from-secondary/10 hover:to-primary/10"
            }`}
            onClick={() => setSelectedCreationMethod('ai')}
          >
            <div className={`mx-auto mb-4 p-4 rounded-full w-16 h-16 flex items-center justify-center ${
              selectedCreationMethod === 'ai'
                ? "bg-gradient-to-br from-secondary/20 to-primary/20 animate-brand-glow" 
                : "bg-primary/10 hover:animate-pulse-glow"
            }`}>
              <Sparkles className={`h-8 w-8 ${
                selectedCreationMethod === 'ai' 
                  ? "text-primary animate-pulse" 
                  : "text-primary"
              }`} />
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              Generazione AI
            </CardTitle>
            <p className="text-muted-foreground mb-4">
              Utilizza l'intelligenza artificiale per creare automaticamente un piano personalizzato basato sui dati del paziente.
            </p>
            <Badge className="bg-accent text-accent-foreground">
              Consigliato
            </Badge>
          </Card>

          {/* Template Selection */}
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              selectedCreationMethod === "template" 
                ? "ring-2 ring-secondary bg-secondary/10 dark:bg-secondary/20" 
                : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedCreationMethod("template")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-secondary/10 dark:bg-secondary/20 rounded-full w-16 h-16 flex items-center justify-center">
                <Layout className="h-8 w-8 text-secondary" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">
                Da Template
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Scegli da una selezione di template predefiniti
              </p>
              <Badge className="bg-secondary text-secondary-foreground">
                Veloce
              </Badge>
            </CardContent>
          </Card>

          {/* PDF Upload */}
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              selectedCreationMethod === "pdf" 
                ? "ring-2 ring-tertiary bg-tertiary/10 dark:bg-tertiary/20" 
                : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedCreationMethod("pdf")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-tertiary/10 dark:bg-tertiary/20 rounded-full w-16 h-16 flex items-center justify-center">
                <FileText className="h-8 w-8 text-tertiary" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">
                Carica PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                Carica un piano alimentare esistente in formato PDF
              </p>
              <Badge className="bg-tertiary text-tertiary-foreground">
                Personalizzato
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Template Selection */}
        {selectedCreationMethod === "template" && (
          <Card className="w-full bg-card rounded-3xl border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                Seleziona Template
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedTemplate === template.id
                        ? "ring-2 ring-primary bg-primary/10 dark:bg-primary/20"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground">
                        {template.name}
                      </h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDF Upload */}
        {selectedCreationMethod === "pdf" && (
          <Card className="w-full bg-card rounded-3xl border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                Carica Piano Alimentare
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Trascina qui il tuo file PDF o clicca per selezionarlo
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="rounded-2xl"
                >
                  Seleziona File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {uploadedFile && (
                  <div className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                    <p className="text-primary font-medium">
                      File caricato: {uploadedFile.name}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Data Summary */}
        {patientData && (
          <Card className="w-full bg-card rounded-3xl border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">
                Riepilogo Dati Paziente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-foreground">
                    Nome:
                  </span>{" "}
                  {patientData.name}
                </div>
                <div>
                  <span className="font-semibold text-foreground">
                    Cognome:
                  </span>{" "}
                  {patientData.surname}
                </div>
                <div>
                  <span className="font-semibold text-foreground">
                    Calorie Target:
                  </span>{" "}
                  {patientData.targetCalories}
                </div>
                <div>
                  <span className="font-semibold text-foreground">
                    Obiettivo Principale:
                  </span>{" "}
                  {patientData.mainGoal}
                </div>
                {patientData.restrictions.length > 0 && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Restrizioni:
                    </span>{" "}
                    {patientData.restrictions.join(", ")}
                  </div>
                )}
                {patientData.allergies.length > 0 && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Allergie:
                    </span>{" "}
                    {patientData.allergies.join(", ")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            className="rounded-2xl px-8 py-3"
            disabled={isLoading}
          >
            Indietro
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className={`rounded-2xl px-8 py-3 font-semibold transition-all duration-1200 ${
              isLoading 
                ? 'bg-gradient-to-r from-secondary to-primary text-primary-foreground animate-ai-loading shadow-brand-gradient' 
                : 'bg-accent hover:bg-accent/90 text-accent-foreground hover:shadow-brand-accent hover:scale-105'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-ai-spin" />
                Generando...
              </>
            ) : (
              "Genera Piano"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
