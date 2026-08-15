UPDATE vocabulary SET topic_id = (SELECT id FROM topics WHERE code = 'family')
WHERE lower(word) IN ('appliance', 'linen', 'landlord', 'tenant', 'lease');
