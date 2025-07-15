-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS diet_plan_meals CASCADE;
DROP TABLE IF EXISTS diet_plans CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Create patients table with enhanced structure
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER NOT NULL,
    height INTEGER NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    target_calories INTEGER NOT NULL,
    main_goal VARCHAR(50) NOT NULL,
    restrictions TEXT[] DEFAULT ARRAY[]::TEXT[],
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    compliance INTEGER DEFAULT 0,
    last_access VARCHAR(50) DEFAULT 'Mai',
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('active', 'inactive', 'new')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diet_plans table
CREATE TABLE diet_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    total_calories INTEGER,
    created_by VARCHAR(255) DEFAULT 'Dietista',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diet_plan_meals table for detailed meal structure
CREATE TABLE diet_plan_meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
    meal_type VARCHAR(50) NOT NULL, -- 'colazione', 'spuntino_mattina', 'pranzo', etc.
    meal_name VARCHAR(255) NOT NULL,
    meal_time TIME,
    food_items JSONB NOT NULL DEFAULT '[]'::JSONB, -- Array of food items with details
    total_calories INTEGER DEFAULT 0,
    notes TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_diet_plans_patient_id ON diet_plans(patient_id);
CREATE INDEX idx_diet_plans_active ON diet_plans(is_active);
CREATE INDEX idx_diet_plan_meals_diet_plan_id ON diet_plan_meals(diet_plan_id);
CREATE INDEX idx_diet_plan_meals_day_meal ON diet_plan_meals(day_of_week, meal_type);

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plan_meals ENABLE ROW LEVEL SECURITY;

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

-- Create policies for diet_plan_meals table
CREATE POLICY "Enable read access for all users" ON diet_plan_meals FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON diet_plan_meals FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON diet_plan_meals FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON diet_plan_meals FOR DELETE USING (true);
