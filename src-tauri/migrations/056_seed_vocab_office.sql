UPDATE vocabulary SET topic_id = (SELECT id FROM topics WHERE code = 'office_work')
WHERE lower(word) IN ('invoice', 'deadline', 'conference', 'memo', 'payroll', 'appraisal', 'colleague', 'personnel', 'overtime', 'downsize', 'teamwork', 'delegate', 'agenda', 'minutes', 'report', 'archive', 'workplace', 'manager');
