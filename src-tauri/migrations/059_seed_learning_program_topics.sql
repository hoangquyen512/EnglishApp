INSERT INTO learning_program_topics (program_id, topic_id)
SELECT lp.id, t.id
FROM learning_program lp
CROSS JOIN topics t
WHERE t.code IN ('family', 'food_dining', 'office_work', 'travel');
