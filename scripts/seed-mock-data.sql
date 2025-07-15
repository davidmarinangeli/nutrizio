-- Insert mock patients
INSERT INTO patients (id, name, surname, email, age, height, weight, target_calories, main_goal, restrictions, allergies, notes, compliance, last_access, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Mario', 'Rossi', 'mario.rossi@email.com', 35, 180, 75.5, 2200, 'weight-loss', ARRAY['Vegetariano']::TEXT[], ARRAY['Noci']::TEXT[], 'Preferisce pasti leggeri a cena. Molto attivo nel weekend.', 92, '2 ore fa', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'Giulia', 'Bianchi', 'giulia.bianchi@email.com', 28, 165, 58.0, 1800, 'muscle-gain', ARRAY['Senza Glutine']::TEXT[], ARRAY['Latticini']::TEXT[], 'Atleta professionista, necessita di proteine extra post-allenamento.', 87, '1 giorno fa', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Luca', 'Verdi', 'luca.verdi@email.com', 42, 175, 82.0, 2000, 'weight-loss', ARRAY['Diabetico']::TEXT[], ARRAY[]::TEXT[], 'Controllo glicemico importante. Evitare zuccheri semplici.', 76, '3 giorni fa', 'inactive'),
('550e8400-e29b-41d4-a716-446655440004', 'Anna', 'Neri', 'anna.neri@email.com', 31, 170, 65.0, 1900, 'maintenance', ARRAY['Vegano']::TEXT[], ARRAY['Soia']::TEXT[], 'Molto attiva, pratica yoga quotidianamente. Preferisce cibi biologici.', 95, '1 ora fa', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'Francesco', 'Blu', 'francesco.blu@email.com', 26, 185, 70.0, 2400, 'weight-gain', ARRAY[]::TEXT[], ARRAY['Pesce']::TEXT[], 'Nuovo paziente, primo approccio alla dieta strutturata.', 0, 'Mai', 'new');

-- Insert diet plans for each patient
INSERT INTO diet_plans (id, patient_id, name, description, start_date, end_date, is_active, total_calories, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Piano Vegetariano Dimagrante', 'Piano alimentare vegetariano per perdita di peso graduale', '2024-01-01', '2024-03-31', true, 2200, 'Dr. Nutritionist'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Piano Proteico Atleta', 'Piano ad alto contenuto proteico per aumento massa muscolare', '2024-01-15', '2024-06-15', true, 1800, 'Dr. Nutritionist'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Piano Diabetico Controllato', 'Piano per controllo glicemico e perdita di peso', '2023-12-01', '2024-05-31', true, 2000, 'Dr. Nutritionist'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Piano Vegano Bilanciato', 'Piano vegano per mantenimento peso forma', '2024-02-01', '2024-07-31', true, 1900, 'Dr. Nutritionist'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Piano Aumento Peso', 'Piano ipercalorico per aumento di peso sano', '2024-03-01', '2024-08-31', true, 2400, 'Dr. Nutritionist');

-- Insert detailed meal plans for Mario Rossi (Vegetarian Weight Loss)
INSERT INTO diet_plan_meals (diet_plan_id, day_of_week, meal_type, meal_name, meal_time, food_items, total_calories, notes, order_index) VALUES
-- Monday meals for Mario
('660e8400-e29b-41d4-a716-446655440001', 1, 'colazione', 'Colazione Proteica', '08:00', 
'[
  {"id": 1, "name": "Yogurt greco 0%", "quantity": "200", "unit": "g", "calories": 130, "alternatives": [{"name": "Skyr naturale", "quantity": "180", "unit": "g", "calories": 120}, {"name": "Ricotta magra", "quantity": "150", "unit": "g", "calories": 140}]},
  {"id": 2, "name": "Frutti di bosco misti", "quantity": "100", "unit": "g", "calories": 50, "alternatives": [{"name": "Fragole fresche", "quantity": "150", "unit": "g", "calories": 45}, {"name": "Mirtilli", "quantity": "80", "unit": "g", "calories": 55}]},
  {"id": 3, "name": "Granola senza zucchero", "quantity": "30", "unit": "g", "calories": 120, "alternatives": [{"name": "Fiocchi d avena", "quantity": "40", "unit": "g", "calories": 140}, {"name": "Muesli integrale", "quantity": "35", "unit": "g", "calories": 130}]},
  {"id": 4, "name": "Mandorle", "quantity": "15", "unit": "g", "calories": 90, "alternatives": [{"name": "Noci", "quantity": "12", "unit": "g", "calories": 85}, {"name": "Semi di girasole", "quantity": "20", "unit": "g", "calories": 115}]}
]'::JSONB, 390, 'Ricca di proteine per iniziare la giornata', 1),

('660e8400-e29b-41d4-a716-446655440001', 1, 'spuntino_mattina', 'Spuntino Energetico', '10:30', 
'[
  {"id": 5, "name": "Mela verde", "quantity": "1", "unit": "media", "calories": 80, "alternatives": [{"name": "Pera", "quantity": "1", "unit": "media", "calories": 85}, {"name": "Kiwi", "quantity": "2", "unit": "pezzi", "calories": 90}]},
  {"id": 6, "name": "Tè verde", "quantity": "1", "unit": "tazza", "calories": 2, "alternatives": [{"name": "Tè bianco", "quantity": "1", "unit": "tazza", "calories": 2}, {"name": "Infuso di erbe", "quantity": "1", "unit": "tazza", "calories": 0}]}
]'::JSONB, 82, 'Spuntino leggero e idratante', 2),

('660e8400-e29b-41d4-a716-446655440001', 1, 'pranzo', 'Pranzo Vegetariano', '13:00', 
'[
  {"id": 7, "name": "Quinoa tricolore", "quantity": "80", "unit": "g", "calories": 280, "alternatives": [{"name": "Farro perlato", "quantity": "80", "unit": "g", "calories": 270}, {"name": "Riso integrale", "quantity": "80", "unit": "g", "calories": 285}]},
  {"id": 8, "name": "Ceci lessati", "quantity": "100", "unit": "g", "calories": 120, "alternatives": [{"name": "Lenticchie rosse", "quantity": "100", "unit": "g", "calories": 115}, {"name": "Fagioli cannellini", "quantity": "100", "unit": "g", "calories": 125}]},
  {"id": 9, "name": "Verdure grigliate miste", "quantity": "200", "unit": "g", "calories": 80, "alternatives": [{"name": "Insalata mista", "quantity": "150", "unit": "g", "calories": 25}, {"name": "Spinaci saltati", "quantity": "200", "unit": "g", "calories": 45}]},
  {"id": 10, "name": "Olio extravergine oliva", "quantity": "10", "unit": "ml", "calories": 90, "alternatives": [{"name": "Olio di semi di lino", "quantity": "10", "unit": "ml", "calories": 85}, {"name": "Avocado", "quantity": "50", "unit": "g", "calories": 80}]}
]'::JSONB, 570, 'Pranzo completo e bilanciato', 3),

('660e8400-e29b-41d4-a716-446655440001', 1, 'spuntino_pomeriggio', 'Spuntino Proteico', '16:30', 
'[
  {"id": 11, "name": "Hummus di ceci", "quantity": "50", "unit": "g", "calories": 120, "alternatives": [{"name": "Crema di mandorle", "quantity": "20", "unit": "g", "calories": 130}, {"name": "Ricotta con erbe", "quantity": "80", "unit": "g", "calories": 110}]},
  {"id": 12, "name": "Bastoncini di carote", "quantity": "100", "unit": "g", "calories": 35, "alternatives": [{"name": "Sedano", "quantity": "100", "unit": "g", "calories": 20}, {"name": "Peperoni a strisce", "quantity": "100", "unit": "g", "calories": 30}]}
]'::JSONB, 155, 'Spuntino saziante e nutriente', 4),

('660e8400-e29b-41d4-a716-446655440001', 1, 'cena', 'Cena Leggera', '20:00', 
'[
  {"id": 13, "name": "Tofu alla griglia", "quantity": "120", "unit": "g", "calories": 180, "alternatives": [{"name": "Tempeh", "quantity": "100", "unit": "g", "calories": 190}, {"name": "Seitan", "quantity": "100", "unit": "g", "calories": 140}]},
  {"id": 14, "name": "Broccoli al vapore", "quantity": "200", "unit": "g", "calories": 55, "alternatives": [{"name": "Cavolfiori", "quantity": "200", "unit": "g", "calories": 50}, {"name": "Zucchine", "quantity": "250", "unit": "g", "calories": 40}]},
  {"id": 15, "name": "Patate dolci al forno", "quantity": "150", "unit": "g", "calories": 130, "alternatives": [{"name": "Zucca butternut", "quantity": "200", "unit": "g", "calories": 90}, {"name": "Carote al forno", "quantity": "200", "unit": "g", "calories": 80}]},
  {"id": 16, "name": "Insalata verde", "quantity": "100", "unit": "g", "calories": 15, "alternatives": [{"name": "Rucola", "quantity": "80", "unit": "g", "calories": 20}, {"name": "Spinaci baby", "quantity": "100", "unit": "g", "calories": 25}]}
]'::JSONB, 380, 'Cena leggera e digeribile', 5);

-- Insert meals for Tuesday for Mario
INSERT INTO diet_plan_meals (diet_plan_id, day_of_week, meal_type, meal_name, meal_time, food_items, total_calories, notes, order_index) VALUES
('660e8400-e29b-41d4-a716-446655440001', 2, 'colazione', 'Colazione Energetica', '08:00', 
'[
  {"id": 17, "name": "Porridge di avena", "quantity": "50", "unit": "g", "calories": 180, "alternatives": [{"name": "Chia pudding", "quantity": "40", "unit": "g", "calories": 160}, {"name": "Smoothie bowl", "quantity": "250", "unit": "ml", "calories": 200}]},
  {"id": 18, "name": "Banana", "quantity": "1", "unit": "media", "calories": 105, "alternatives": [{"name": "Mango", "quantity": "100", "unit": "g", "calories": 60}, {"name": "Papaya", "quantity": "150", "unit": "g", "calories": 65}]},
  {"id": 19, "name": "Semi di chia", "quantity": "10", "unit": "g", "calories": 50, "alternatives": [{"name": "Semi di lino", "quantity": "10", "unit": "g", "calories": 55}, {"name": "Semi di zucca", "quantity": "15", "unit": "g", "calories": 85}]},
  {"id": 20, "name": "Latte di mandorla", "quantity": "200", "unit": "ml", "calories": 50, "alternatives": [{"name": "Latte di avena", "quantity": "200", "unit": "ml", "calories": 80}, {"name": "Latte di soia", "quantity": "200", "unit": "ml", "calories": 85}]}
]'::JSONB, 385, 'Colazione ricca di fibre', 1);

-- Add comprehensive meal data for Giulia Bianchi (Athlete Protein Plan)
INSERT INTO diet_plan_meals (diet_plan_id, day_of_week, meal_type, meal_name, meal_time, food_items, total_calories, notes, order_index) VALUES
('660e8400-e29b-41d4-a716-446655440002', 1, 'colazione', 'Colazione Pre-Allenamento', '07:00', 
'[
  {"id": 21, "name": "Uova strapazzate", "quantity": "3", "unit": "uova", "calories": 210, "alternatives": [{"name": "Albumi", "quantity": "6", "unit": "albumi", "calories": 180}, {"name": "Tofu scramble", "quantity": "150", "unit": "g", "calories": 200}]},
  {"id": 22, "name": "Pane senza glutine", "quantity": "2", "unit": "fette", "calories": 140, "alternatives": [{"name": "Gallette di riso", "quantity": "4", "unit": "pezzi", "calories": 120}, {"name": "Pane di quinoa", "quantity": "2", "unit": "fette", "calories": 160}]},
  {"id": 23, "name": "Avocado", "quantity": "0.5", "unit": "avocado", "calories": 160, "alternatives": [{"name": "Burro di mandorle", "quantity": "20", "unit": "g", "calories": 130}, {"name": "Olio di cocco", "quantity": "10", "unit": "ml", "calories": 90}]},
  {"id": 24, "name": "Spinaci freschi", "quantity": "50", "unit": "g", "calories": 12, "alternatives": [{"name": "Rucola", "quantity": "50", "unit": "g", "calories": 15}, {"name": "Lattuga", "quantity": "80", "unit": "g", "calories": 10}]}
]'::JSONB, 522, 'Colazione ad alto contenuto proteico per atleti', 1);

-- Add sample meals for Luca (Diabetic Plan)
INSERT INTO diet_plan_meals (diet_plan_id, day_of_week, meal_type, meal_name, meal_time, food_items, total_calories, notes, order_index) VALUES
('660e8400-e29b-41d4-a716-446655440003', 1, 'colazione', 'Colazione Diabetico-Friendly', '08:30', 
'[
  {"id": 25, "name": "Fiocchi di avena integrali", "quantity": "40", "unit": "g", "calories": 150, "alternatives": [{"name": "Crusca di avena", "quantity": "30", "unit": "g", "calories": 110}, {"name": "Quinoa soffiata", "quantity": "35", "unit": "g", "calories": 130}]},
  {"id": 26, "name": "Latte scremato", "quantity": "200", "unit": "ml", "calories": 70, "alternatives": [{"name": "Latte di mandorla non zuccherato", "quantity": "200", "unit": "ml", "calories": 40}, {"name": "Yogurt greco 0%", "quantity": "150", "unit": "g", "calories": 90}]},
  {"id": 27, "name": "Mirtilli freschi", "quantity": "80", "unit": "g", "calories": 45, "alternatives": [{"name": "Lamponi", "quantity": "80", "unit": "g", "calories": 40}, {"name": "Fragole", "quantity": "100", "unit": "g", "calories": 35}]},
  {"id": 28, "name": "Cannella", "quantity": "2", "unit": "g", "calories": 5, "alternatives": [{"name": "Vaniglia", "quantity": "1", "unit": "ml", "calories": 2}, {"name": "Cardamomo", "quantity": "1", "unit": "g", "calories": 3}]}
]'::JSONB, 270, 'Colazione a basso indice glicemico', 1);

-- Add meals for Anna (Vegan Plan)
INSERT INTO diet_plan_meals (diet_plan_id, day_of_week, meal_type, meal_name, meal_time, food_items, total_calories, notes, order_index) VALUES
('660e8400-e29b-41d4-a716-446655440004', 1, 'colazione', 'Colazione Vegana Energetica', '08:00', 
'[
  {"id": 29, "name": "Smoothie verde", "quantity": "300", "unit": "ml", "calories": 180, "alternatives": [{"name": "Succo di verdure", "quantity": "250", "unit": "ml", "calories": 120}, {"name": "Frullato di frutta", "quantity": "300", "unit": "ml", "calories": 200}]},
  {"id": 30, "name": "Semi di girasole", "quantity": "20", "unit": "g", "calories": 115, "alternatives": [{"name": "Semi di zucca", "quantity": "20", "unit": "g", "calories": 110}, {"name": "Anacardi", "quantity": "15", "unit": "g", "calories": 85}]},
  {"id": 31, "name": "Pane integrale", "quantity": "2", "unit": "fette", "calories": 140, "alternatives": [{"name": "Crackers integrali", "quantity": "6", "unit": "pezzi", "calories": 120}, {"name": "Gallette di mais", "quantity": "4", "unit": "pezzi", "calories": 100}]}
]'::JSONB, 435, 'Colazione vegana ricca di nutrienti', 1);

-- Add meals for Francesco (Weight Gain Plan)
INSERT INTO diet_plan_meals (diet_plan_id, day_of_week, meal_type, meal_name, meal_time, food_items, total_calories, notes, order_index) VALUES
('660e8400-e29b-41d4-a716-446655440005', 1, 'colazione', 'Colazione Ipercalorica', '08:00', 
'[
  {"id": 32, "name": "Pancakes proteici", "quantity": "3", "unit": "pezzi", "calories": 350, "alternatives": [{"name": "French toast", "quantity": "3", "unit": "fette", "calories": 320}, {"name": "Waffle integrali", "quantity": "2", "unit": "pezzi", "calories": 300}]},
  {"id": 33, "name": "Burro di arachidi", "quantity": "30", "unit": "g", "calories": 180, "alternatives": [{"name": "Burro di mandorle", "quantity": "30", "unit": "g", "calories": 190}, {"name": "Nutella", "quantity": "25", "unit": "g", "calories": 135}]},
  {"id": 34, "name": "Banana", "quantity": "1", "unit": "grande", "calories": 120, "alternatives": [{"name": "Mango", "quantity": "150", "unit": "g", "calories": 90}, {"name": "Datteri", "quantity": "4", "unit": "pezzi", "calories": 100}]},
  {"id": 35, "name": "Latte intero", "quantity": "250", "unit": "ml", "calories": 150, "alternatives": [{"name": "Latte di cocco", "quantity": "200", "unit": "ml", "calories": 180}, {"name": "Shake proteico", "quantity": "250", "unit": "ml", "calories": 200}]}
]'::JSONB, 800, 'Colazione ad alto contenuto calorico', 1);
