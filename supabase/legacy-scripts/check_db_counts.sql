-- Check counts
SELECT 'users' as table_name, count(*) FROM users
UNION ALL
SELECT 'profiles' as table_name, count(*) FROM profiles;

-- Check profiles columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Check profiles data sample
SELECT * FROM profiles LIMIT 5;
