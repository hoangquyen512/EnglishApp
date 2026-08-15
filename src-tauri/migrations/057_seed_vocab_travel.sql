UPDATE vocabulary SET topic_id = (SELECT id FROM topics WHERE code = 'travel')
WHERE lower(word) IN ('reservation', 'itinerary', 'destination', 'luggage', 'hospitality', 'concierge', 'boarding', 'gate', 'terminal', 'flight', 'departure', 'arrival', 'fare', 'ticket', 'passport', 'layover', 'excursion', 'nonstop');
