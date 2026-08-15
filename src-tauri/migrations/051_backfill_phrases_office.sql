UPDATE phrases SET topic_id = (SELECT id FROM topics WHERE code = 'office_work') WHERE topic = 'office';
