-- Change date-only fields from TIMESTAMP/TEXT to DATE type
-- This is more semantically correct for fields like dateOfBirth, passportIssueDate, etc.
-- that don't need time information

-- Patients table
ALTER TABLE "patients" 
  ALTER COLUMN "dateOfBirth" TYPE DATE USING "dateOfBirth"::DATE,
  ALTER COLUMN "passportIssueDate" TYPE DATE USING "passportIssueDate"::DATE,
  ALTER COLUMN "passportExpiryDate" TYPE DATE USING "passportExpiryDate"::DATE;

-- Employees table
-- Note: hireDate and terminationDate were TEXT, converting to DATE
ALTER TABLE "employees" 
  ALTER COLUMN "dateOfBirth" TYPE DATE USING "dateOfBirth"::DATE,
  ALTER COLUMN "passportIssueDate" TYPE DATE USING "passportIssueDate"::DATE,
  ALTER COLUMN "passportExpiryDate" TYPE DATE USING "passportExpiryDate"::DATE,
  ALTER COLUMN "hireDate" TYPE DATE USING 
    CASE 
      WHEN "hireDate" IS NULL THEN NULL
      WHEN "hireDate" ~ '^\d{4}-\d{2}-\d{2}' THEN "hireDate"::DATE
      ELSE NULL
    END,
  ALTER COLUMN "terminationDate" TYPE DATE USING 
    CASE 
      WHEN "terminationDate" IS NULL THEN NULL
      WHEN "terminationDate" ~ '^\d{4}-\d{2}-\d{2}' THEN "terminationDate"::DATE
      ELSE NULL
    END;
