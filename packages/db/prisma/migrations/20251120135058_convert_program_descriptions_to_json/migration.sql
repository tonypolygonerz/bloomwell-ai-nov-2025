-- AlterTable
-- Convert programDescriptions from TEXT to JSONB
-- Handle existing string data: if it looks like JSON (starts with [ or {), try to parse it; otherwise wrap as JSON string
ALTER TABLE "Organization" ALTER COLUMN "programDescriptions" TYPE JSONB USING 
  CASE 
    WHEN "programDescriptions" IS NULL THEN NULL
    WHEN trim("programDescriptions"::text) = '' THEN NULL
    WHEN trim("programDescriptions"::text) ~ '^[\s]*[\[{]' THEN 
      -- Try to parse as JSON, if it fails the migration will error and can be handled manually
      "programDescriptions"::text::jsonb
    ELSE 
      -- Wrap plain text as JSON string value
      to_jsonb("programDescriptions"::text)
  END;

