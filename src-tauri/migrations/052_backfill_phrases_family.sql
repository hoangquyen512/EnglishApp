UPDATE phrases SET topic_id = (SELECT id FROM topics WHERE code = 'family') WHERE topic = 'family';
