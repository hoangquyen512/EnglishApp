UPDATE phrases SET topic_id = (SELECT id FROM topics WHERE code = 'travel') WHERE topic = 'travel';
