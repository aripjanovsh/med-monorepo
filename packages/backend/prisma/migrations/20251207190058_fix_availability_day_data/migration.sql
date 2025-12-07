-- Convert numeric day arrays to string arrays
UPDATE "employee_availability" SET "repeatOn" = ARRAY(
  SELECT CASE 
    WHEN elem = '0' THEN 'sunday'
    WHEN elem = '1' THEN 'monday'
    WHEN elem = '2' THEN 'tuesday'
    WHEN elem = '3' THEN 'wednesday'
    WHEN elem = '4' THEN 'thursday'
    WHEN elem = '5' THEN 'friday'
    WHEN elem = '6' THEN 'saturday'
    ELSE elem
  END
  FROM unnest("repeatOn") AS elem
) WHERE "repeatOn" IS NOT NULL;