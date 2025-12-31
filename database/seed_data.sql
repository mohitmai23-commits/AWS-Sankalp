
-- Seed data for video questions (pre-stored questions every 30 seconds)

-- Infinite Potential Well Video Questions
INSERT INTO video_questions (video_id, timestamp, question_text, options, correct_option) VALUES
('infinite_well_intro', 30, 'What defines an infinite potential well?', '["Finite barriers", "Infinitely high walls", "No barriers", "Curved walls"]', 1),
('infinite_well_intro', 60, 'What happens to the particle inside the well?', '["It escapes", "It is confined", "It disappears", "It duplicates"]', 1),
('infinite_well_intro', 90, 'What is the key equation for this system?', '["Newton''s law", "Schrödinger equation", "Maxwell''s equation", "Einstein''s equation"]', 1);

-- Tunnelling Effect Video Questions
INSERT INTO video_questions (video_id, timestamp, question_text, options, correct_option) VALUES
('tunnelling_intro', 30, 'What allows quantum tunnelling to occur?', '["High energy", "Wave nature of particles", "Particle speed", "Large mass"]', 1),
('tunnelling_intro', 60, 'In classical physics, can particles tunnel?', '["Yes, always", "No, never", "Sometimes", "Only at high temperatures"]', 1),
('tunnelling_intro', 90, 'What is tunnelling used in?', '["Cooking", "Semiconductor devices", "Photography", "Sound systems"]', 1);

-- Finite Potential Well Video Questions
INSERT INTO video_questions (video_id, timestamp, question_text, options, correct_option) VALUES
('finite_well_intro', 30, 'How does a finite well differ from infinite well?', '["No difference", "Walls have finite height", "Particle can escape", "Both B and C"]', 3),
('finite_well_intro', 60, 'Can the wave function extend beyond finite walls?', '["Yes", "No", "Only at high energy", "Only at low energy"]', 0),
('finite_well_intro', 90, 'What happens when particle energy exceeds barrier height?', '["It reflects", "It tunnels", "It escapes completely", "It disappears"]', 2);