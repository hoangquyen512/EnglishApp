UPDATE vocabulary SET topic_id = (SELECT id FROM topics WHERE code = 'food_dining')
WHERE lower(word) IN ('catering', 'buffet', 'beverage', 'appetizer', 'chef', 'cuisine', 'refill', 'a-la-carte', 'vegetarian', 'recipe', 'portion');
