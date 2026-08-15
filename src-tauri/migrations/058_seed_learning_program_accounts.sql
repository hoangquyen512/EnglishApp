INSERT INTO learning_program (user_id, program_name, level_preference, content_type_preference)
SELECT id, 'Chương trình học của tôi', 'A2', 'both' FROM accounts;
