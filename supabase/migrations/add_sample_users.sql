-- Add sample users to the system
-- This script will create users in auth.users and their corresponding roles in user_roles

-- Note: In a real production environment, you would typically create these users
-- through the Supabase dashboard or API, but for development purposes,
-- we'll insert them directly into the auth.users table

-- First, check if users already exist and get their IDs
DO $$
DECLARE
    admin_user_id UUID;
    personnel_user_id UUID;
    logs_user_id UUID;
BEGIN
    -- Check for existing admin user
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'g1galba042804@gmail.com';
    
    -- Check for existing personnel user
    SELECT id INTO personnel_user_id 
    FROM auth.users 
    WHERE email = 'gamerboy282004@yahoo.com';
    
    -- Check for existing logs user
    SELECT id INTO logs_user_id 
    FROM auth.users 
    WHERE email = 'illuminat30@gmail.com';
    
    -- Insert admin user if not exists
    IF admin_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            'g1galba042804@gmail.com',
            crypt('lolsomuch28', gen_salt('bf')),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            '{"first_name": "Glenn", "last_name": "Galbadores"}'
        );
        
        -- Get the newly created admin user ID
        SELECT id INTO admin_user_id 
        FROM auth.users 
        WHERE email = 'g1galba042804@gmail.com';
    END IF;
    
    -- Insert personnel user if not exists
    IF personnel_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            'gamerboy282004@yahoo.com',
            crypt('lolsomuch28', gen_salt('bf')),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            '{"first_name": "Nnelg", "last_name": "Serodablag"}'
        );
        
        -- Get the newly created personnel user ID
        SELECT id INTO personnel_user_id 
        FROM auth.users 
        WHERE email = 'gamerboy282004@yahoo.com';
    END IF;
    
    -- Insert logs user if not exists
    IF logs_user_id IS NULL THEN
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        ) VALUES (
            gen_random_uuid(),
            'illuminat30@gmail.com',
            crypt('lolsomuch28', gen_salt('bf')),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            '{"first_name": "Logs", "last_name": "Test"}'
        );
        
        -- Get the newly created logs user ID
        SELECT id INTO logs_user_id 
        FROM auth.users 
        WHERE email = 'illuminat30@gmail.com';
    END IF;
    
    -- Insert or update admin role
    INSERT INTO user_roles (user_id, role, first_name, last_name, email)
    VALUES (admin_user_id, 'admin', 'Glenn', 'Galbadores', 'g1galba042804@gmail.com')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        first_name = 'Glenn',
        last_name = 'Galbadores',
        email = 'g1galba042804@gmail.com',
        updated_at = CURRENT_TIMESTAMP;
    
    -- Insert or update personnel role
    INSERT INTO user_roles (user_id, role, first_name, last_name, email)
    VALUES (personnel_user_id, 'personnel', 'Nnelg', 'Serodablag', 'gamerboy282004@yahoo.com')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'personnel',
        first_name = 'Nnelg',
        last_name = 'Serodablag',
        email = 'gamerboy282004@yahoo.com',
        updated_at = CURRENT_TIMESTAMP;
    
    -- Insert or update logs role
    INSERT INTO user_roles (user_id, role, first_name, last_name, email)
    VALUES (logs_user_id, 'log', 'Logs', 'Test', 'illuminat30@gmail.com')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'log',
        first_name = 'Logs',
        last_name = 'Test',
        email = 'illuminat30@gmail.com',
        updated_at = CURRENT_TIMESTAMP;
        
    RAISE NOTICE 'Sample users created/updated successfully';
END $$; 