-- Cleanup script to remove or fix 'undefined' progress entries
-- Run this once after updating the frontend code

-- Option 1: Delete all 'undefined' progress entries
DELETE FROM progress WHERE topic = 'undefined';

-- Option 2: If you want to update 'undefined' to a specific topic instead, uncomment:
-- UPDATE progress SET topic = 'Infinite Potential Well' WHERE topic = 'undefined' AND subtopic LIKE '1.%';
-- UPDATE progress SET topic = 'Finite Potential Well' WHERE topic = 'undefined' AND subtopic LIKE '2.%';
-- UPDATE progress SET topic = 'Tunnelling Effect' WHERE topic = 'undefined' AND subtopic LIKE '3.%';

-- Verify cleanup
SELECT * FROM progress ORDER BY user_id, topic, subtopic;
