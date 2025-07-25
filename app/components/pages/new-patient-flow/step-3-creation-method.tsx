"use client"

import { useRef } from "react"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { ChevronLeft, Moon, Sun, Brain, FileText, Layout, Upload, Loader2 } from "lucide-react"

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
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-6xl mx-auto p-4 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full bg-emerald-400 text-white hover:bg-emerald-500 shadow-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
            Nuovo Paziente - Metodo di Creazione
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full bg-gray-100 dark:bg-gray-800"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Generation */}
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              selectedCreationMethod === "ai" 
                ? "ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-ai-gradient" 
                : "hover:shadow-lg hover:shadow-ai-blue hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-emerald-50 dark:hover:from-blue-900/20 dark:hover:to-emerald-900/20"
            }`}
            onClick={() => setSelectedCreationMethod("ai")}
          >
            <CardHeader className="text-center">
              <div className={`mx-auto mb-4 p-4 rounded-full w-16 h-16 flex items-center justify-center transition-all duration-1200 ${
                selectedCreationMethod === "ai" 
                  ? "bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/40 dark:to-emerald-900/40 animate-ai-glow" 
                  : "bg-emerald-100 dark:bg-emerald-900/40 hover:animate-ai-pulse"
              }`}>
                <Brain className={`h-8 w-8 transition-all duration-1200 ${
                  selectedCreationMethod === "ai" 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-emerald-600 dark:text-emerald-400"
                }`} />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
                Generazione AI
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                L'AI creerà un piano personalizzato basato sui dati del paziente
              </p>
              <Badge className="bg-emerald-500 text-white">
                Raccomandato
              </Badge>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              selectedCreationMethod === "template" 
                ? "ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedCreationMethod("template")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-blue-100 dark:bg-blue-900/40 rounded-full w-16 h-16 flex items-center justify-center">
                <Layout className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
                Da Template
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Scegli da una selezione di template predefiniti
              </p>
              <Badge className="bg-blue-500 text-white">
                Veloce
              </Badge>
            </CardContent>
          </Card>

          {/* PDF Upload */}
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              selectedCreationMethod === "pdf" 
                ? "ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-900/20" 
                : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedCreationMethod("pdf")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-purple-100 dark:bg-purple-900/40 rounded-full w-16 h-16 flex items-center justify-center">
                <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
                Carica PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Carica un piano alimentare esistente in formato PDF
              </p>
              <Badge className="bg-purple-500 text-white">
                Personalizzato
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Template Selection */}
        {selectedCreationMethod === "template" && (
          <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
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
                        ? "ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-800 dark:text-white">
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
          <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Carica Piano Alimentare
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
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
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">
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
          <Card className="w-full bg-white dark:bg-gray-800 rounded-3xl border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                Riepilogo Dati Paziente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    Nome:
                  </span>{" "}
                  {patientData.name}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    Cognome:
                  </span>{" "}
                  {patientData.surname}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    Calorie Target:
                  </span>{" "}
                  {patientData.targetCalories}
                </div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    Obiettivo Principale:
                  </span>{" "}
                  {patientData.mainGoal}
                </div>
                {patientData.restrictions.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      Restrizioni:
                    </span>{" "}
                    {patientData.restrictions.join(", ")}
                  </div>
                )}
                {patientData.allergies.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white">
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
                ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white animate-ai-loading shadow-ai-gradient' 
                : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-glow hover:scale-105'
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
