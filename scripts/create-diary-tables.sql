-- Create diary entries table for tracking patient meal consumption and feedback
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_id TEXT NOT NULL, -- breakfast, lunch, dinner, snack1, etc.
  food_item_id TEXT NOT NULL,
  
  -- What was prescribed in the diet plan
  prescribed_food JSONB NOT NULL, -- {name, quantity, calories}
  
  -- What was actually consumed
  actual_food JSONB NOT NULL, -- {name, quantity, calories, was_substituted}
  
  -- Patient feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diet plan versions table for tracking diet plan changes over time
CREATE TABLE diet_plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL, -- The complete weekly meal plan
  start_date DATE NOT NULL,
  end_date DATE, -- NULL if current version
  created_by UUID NOT NULL REFERENCES auth.users(id), -- The dietitian who created this version
  reason_for_change TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_diary_entries_patient_date ON diary_entries(patient_id, date);
CREATE INDEX idx_diary_entries_date ON diary_entries(date);
CREATE INDEX idx_diet_plan_versions_patient ON diet_plan_versions(patient_id);
CREATE INDEX idx_diet_plan_versions_dates ON diet_plan_versions(patient_id, start_date, end_date);

-- Create RLS policies
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plan_versions ENABLE ROW LEVEL SECURITY;

-- Diary entries policies
CREATE POLICY "Users can view own diary entries" 
  ON diary_entries FOR SELECT 
  USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own diary entries" 
  ON diary_entries FOR INSERT 
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update own diary entries" 
  ON diary_entries FOR UPDATE 
  USING (auth.uid() = patient_id);

-- Dietitians can view diary entries of their patients
CREATE POLICY "Dietitians can view patient diary entries" 
  ON diary_entries FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM patient_dietitian_relationships pdr 
      WHERE pdr.patient_id = diary_entries.patient_id 
      AND pdr.dietitian_id = auth.uid()
      AND pdr.status = 'active'
    )
  );

-- Diet plan versions policies
CREATE POLICY "Users can view own diet plan versions" 
  ON diet_plan_versions FOR SELECT 
  USING (auth.uid() = patient_id);

CREATE POLICY "Dietitians can manage patient diet plan versions" 
  ON diet_plan_versions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM patient_dietitian_relationships pdr 
      WHERE pdr.patient_id = diet_plan_versions.patient_id 
      AND pdr.dietitian_id = auth.uid()
      AND pdr.status = 'active'
    )
  );

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_diary_entries_updated_at 
  BEFORE UPDATE ON diary_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_plan_versions_updated_at 
  BEFORE UPDATE ON diet_plan_versions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample function to get diary entries for a date range
CREATE OR REPLACE FUNCTION get_patient_diary_entries(
  p_patient_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  entry_id UUID,
  entry_date DATE,
  meal_id TEXT,
  food_item_id TEXT,
  prescribed_food JSONB,
  actual_food JSONB,
  rating INTEGER,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    de.id,
    de.date,
    de.meal_id,
    de.food_item_id,
    de.prescribed_food,
    de.actual_food,
    de.rating,
    de.tags,
    de.notes,
    de.created_at
  FROM diary_entries de
  WHERE de.patient_id = p_patient_id
    AND de.date BETWEEN p_start_date AND p_end_date
  ORDER BY de.date, de.meal_id, de.food_item_id;
END;
$$;

-- Sample function to get diet plan for a specific date
CREATE OR REPLACE FUNCTION get_diet_plan_for_date(
  p_patient_id UUID,
  p_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_data JSONB;
BEGIN
  SELECT dpv.plan_data INTO plan_data
  FROM diet_plan_versions dpv
  WHERE dpv.patient_id = p_patient_id
    AND dpv.start_date <= p_date
    AND (dpv.end_date IS NULL OR dpv.end_date >= p_date)
  ORDER BY dpv.start_date DESC
  LIMIT 1;
  
  RETURN COALESCE(plan_data, '{}'::JSONB);
END;
$$;

-- Sample function to calculate weekly compliance
CREATE OR REPLACE FUNCTION calculate_weekly_compliance(
  p_patient_id UUID,
  p_week_start DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_items INTEGER := 0;
  completed_items INTEGER := 0;
  compliance_percentage NUMERIC;
BEGIN
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE (actual_food->>'was_substituted')::BOOLEAN = FALSE) as completed
  INTO total_items, completed_items
  FROM diary_entries
  WHERE patient_id = p_patient_id
    AND date BETWEEN p_week_start AND (p_week_start + INTERVAL '6 days')::DATE;
  
  IF total_items = 0 THEN
    RETURN 0;
  END IF;
  
  compliance_percentage := (completed_items::NUMERIC / total_items::NUMERIC) * 100;
  RETURN ROUND(compliance_percentage, 1);
END;
$$;
