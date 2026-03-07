-- Add email verification columns to users table
-- Run this on your RDS database

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP;

-- Mark existing users as verified (so they can continue logging in)
UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL OR is_verified = FALSE;

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- Show result
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) as verified_users,
    SUM(CASE WHEN NOT is_verified THEN 1 ELSE 0 END) as unverified_users
FROM users;
