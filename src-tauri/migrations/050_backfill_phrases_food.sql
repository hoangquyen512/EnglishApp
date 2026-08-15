UPDATE phrases SET topic_id = (SELECT id FROM topics WHERE code = 'food_dining') WHERE topic = 'food';
