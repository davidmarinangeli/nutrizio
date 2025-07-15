-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER NOT NULL,
    height INTEGER NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    target_calories INTEGER NOT NULL,
    main_goal VARCHAR(50) NOT NULL,
    restrictions TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    notes TEXT,
    compliance INTEGER DEFAULT 0,
    last_access VARCHAR(50) DEFAULT 'Mai',
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('active', 'inactive', 'new')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diet_plans table
CREATE TABLE IF NOT EXISTS diet_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    week_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_diet_plans_patient_id ON diet_plans(patient_id);

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Enable read access for all users" ON patients FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON patients FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON patients FOR DELETE USING (true);

-- Create policies for diet_plans table
CREATE POLICY "Enable read access for all users" ON diet_plans FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON diet_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON diet_plans FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON diet_plans FOR DELETE USING (true);
