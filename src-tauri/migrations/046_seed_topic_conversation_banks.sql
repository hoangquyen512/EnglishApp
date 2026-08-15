INSERT INTO topic_conversation_banks (topic_id, bank_id)
SELECT id, bank FROM topics
JOIN (
  SELECT 'family' AS code, 'family' AS bank UNION ALL
  SELECT 'food_dining', 'cafe' UNION ALL
  SELECT 'food_dining', 'restaurant' UNION ALL
  SELECT 'shopping', 'shopping' UNION ALL
  SELECT 'health', 'health' UNION ALL
  SELECT 'health', 'emergency' UNION ALL
  SELECT 'transportation', 'directions' UNION ALL
  SELECT 'office_work', 'work' UNION ALL
  SELECT 'travel', 'airport' UNION ALL
  SELECT 'travel', 'hotel' UNION ALL
  SELECT 'technology_social_media', 'phone' UNION ALL
  SELECT 'small_talk_greetings', 'greetings'
) AS map ON map.code = topics.code;
