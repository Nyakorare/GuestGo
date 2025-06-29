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
    visitor_user_id UUID;
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
    
    -- Check for existing visitor user
    SELECT id INTO visitor_user_id 
    FROM auth.users 
    WHERE email = 'geko_041702@yahoo.com';
    
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
    
    -- Insert visitor user if not exists
    IF visitor_user_id IS NULL THEN
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
            'geko_041702@yahoo.com',
            crypt('lolsomuch28', gen_salt('bf')),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            '{"first_name": "Geko", "last_name": "Visitor"}'
        );
        
        -- Get the newly created visitor user ID
        SELECT id INTO visitor_user_id 
        FROM auth.users 
        WHERE email = 'geko_041702@yahoo.com';
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
    
    -- Insert or update visitor role
    INSERT INTO user_roles (user_id, role, first_name, last_name, email)
    VALUES (visitor_user_id, 'visitor', 'Geko', 'Visitor', 'geko_041702@yahoo.com')
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'visitor',
        first_name = 'Geko',
        last_name = 'Visitor',
        email = 'geko_041702@yahoo.com',
        updated_at = CURRENT_TIMESTAMP;
        
    RAISE NOTICE 'Sample users created/updated successfully';
END $$; 

-- Add sample places to visit
-- This will create 2 sample places for testing purposes

DO $$
DECLARE
    place1_id UUID;
    place2_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get admin user ID for assignment
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'g1galba042804@gmail.com';
    
    -- Insert first sample place if not exists
    IF NOT EXISTS (SELECT 1 FROM places_to_visit WHERE name = 'Main Office Building') THEN
        INSERT INTO places_to_visit (name, description, location)
        VALUES (
            'Main Office Building',
            'The primary office building where most administrative work is conducted. Features modern facilities and meeting rooms.',
            '123 Business District, Metro Manila'
        ) RETURNING id INTO place1_id;
        
        RAISE NOTICE 'Created sample place 1: Main Office Building with ID: %', place1_id;
    ELSE
        SELECT id INTO place1_id FROM places_to_visit WHERE name = 'Main Office Building';
        RAISE NOTICE 'Sample place 1 already exists: Main Office Building with ID: %', place1_id;
    END IF;
    
    -- Insert second sample place if not exists
    IF NOT EXISTS (SELECT 1 FROM places_to_visit WHERE name = 'Research & Development Center') THEN
        INSERT INTO places_to_visit (name, description, location)
        VALUES (
            'Research & Development Center',
            'State-of-the-art facility dedicated to research, innovation, and product development. Equipped with advanced laboratories and testing equipment.',
            '456 Innovation Park, Quezon City'
        ) RETURNING id INTO place2_id;
        
        RAISE NOTICE 'Created sample place 2: Research & Development Center with ID: %', place2_id;
    ELSE
        SELECT id INTO place2_id FROM places_to_visit WHERE name = 'Research & Development Center';
        RAISE NOTICE 'Sample place 2 already exists: Research & Development Center with ID: %', place2_id;
    END IF;
    
    -- Assign personnel to the first place if admin exists
    IF admin_user_id IS NOT NULL THEN
        -- Get personnel user ID
        DECLARE
            personnel_user_id UUID;
        BEGIN
            SELECT id INTO personnel_user_id 
            FROM auth.users 
            WHERE email = 'gamerboy282004@yahoo.com';
            
            -- Assign personnel to Main Office Building
            IF personnel_user_id IS NOT NULL AND place1_id IS NOT NULL THEN
                INSERT INTO place_personnel (place_id, personnel_id, assigned_by)
                VALUES (place1_id, personnel_user_id, admin_user_id)
                ON CONFLICT (place_id, personnel_id) DO NOTHING;
                
                RAISE NOTICE 'Assigned personnel to Main Office Building';
            END IF;
        END;
    END IF;
    
    RAISE NOTICE 'Sample places created/updated successfully';
END $$; 