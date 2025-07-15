# 🥗 Nutrizio - Sistema di Gestione Pazienti per Dietisti

Nutrizio è un'applicazione web moderna per dietisti e nutrizionisti, che permette di gestire pazienti e generare piani alimentari personalizzati utilizzando l'intelligenza artificiale.

## ✨ Caratteristiche Principali

- **👥 Gestione Pazienti**: Registrazione e gestione completa dei dati dei pazienti
- **🤖 Generazione AI**: Creazione automatica di piani alimentari personalizzati con Google Gemini
- **📊 Dashboard Intuitiva**: Interface moderna e user-friendly
- **🌙 Tema Scuro/Chiaro**: Supporto per entrambe le modalità di visualizzazione
- **📱 Design Responsive**: Ottimizzato per desktop e dispositivi mobili
- **🔒 Database Sicuro**: Integrazione con Supabase per la gestione sicura dei dati

## 🚀 Tecnologie Utilizzate

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Package Manager**: npm/pnpm
- **Form Handling**: React Hook Form

## 📋 Prerequisiti

- Node.js 18+ 
- npm o pnpm
- Account Supabase
- Google Gemini API Key

## 🛠️ Installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/tuo-username/nutrizio.git
   cd nutrizio
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   # oppure
   pnpm install
   ```

3. **Configura le variabili d'ambiente**
   
   Crea un file `.env.local` nella root del progetto:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google Gemini
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Configura il database Supabase**
   
   Esegui gli script SQL nella cartella `scripts/` per creare le tabelle necessarie:
   - `create-tables-v2.sql`
   - `seed-mock-data.sql`

5. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   # oppure
   pnpm dev
   ```

6. **Apri l'applicazione**
   
   Naviga su [http://localhost:3000](http://localhost:3000) (o la porta indicata nel terminale)

## 📁 Struttura del Progetto

```
nutrizio/
├── app/                          # App Router di Next.js
│   ├── components/              # Componenti React
│   │   ├── pages/              # Pagine dell'applicazione
│   │   │   ├── new-patient-flow/  # Flusso creazione paziente
│   │   │   ├── patient-detail-page.tsx
│   │   │   └── patients-list-page.tsx
│   │   └── shared/             # Componenti condivisi
│   ├── actions/                # Server Actions
│   └── globals.css            # Stili globali
├── components/                 # Componenti UI riutilizzabili
│   └── ui/                    # Componenti Shadcn/ui
├── lib/                       # Utilities e configurazioni
│   ├── gemini-api.ts         # Integrazione Google Gemini
│   ├── supabase.ts           # Client e servizi Supabase
│   └── utils.ts              # Utility functions
├── scripts/                   # Script SQL per il database
└── public/                   # Asset statici
```

## 🔧 Funzionalità Dettagliate

### Gestione Pazienti
- Registrazione nuovi pazienti con dati completi
- Visualizzazione lista pazienti con ricerca e filtri
- Dettaglio paziente con storico e piani alimentari

### Generazione Piani Alimentari
- Creazione automatica basata su:
  - Dati antropometrici del paziente
  - Obiettivi nutrizionali
  - Restrizioni alimentari e allergie
  - Numero di pasti giornalieri preferito
- Alternative per ogni alimento
- Calcolo automatico delle calorie

### Editor Piani Alimentari
- Modifica manuale dei piani generati
- Sostituzione alimenti
- Aggiustamento porzioni e calorie
- Salvataggio modifiche

## 🤝 Contribuire

1. Fai il fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 Licenza

Questo progetto è licenziato sotto la licenza MIT - vedi il file [LICENSE](LICENSE) per i dettagli.

## 📞 Supporto

Per domande o supporto, apri un issue su GitHub o contatta [tuo-email@esempio.com]

## 🙏 Riconoscimenti

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Google Gemini](https://developers.generativeai.google/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

---

Sviluppato con ❤️ per i professionisti della nutrizione
