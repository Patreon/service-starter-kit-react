-- Add Users
CREATE USER app_ro WITH PASSWORD 'myPassword';
CREATE USER app_rw WITH PASSWORD 'myPassword';
CREATE USER app_migrate WITH PASSWORD 'myPassword';

-- Create DB
CREATE DATABASE my_starter_kit_db;

-- login to the new DB
\connect my_starter_kit_db;

-- Revoke all Privileges
REVOKE ALL ON DATABASE my_starter_kit_db FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Set up privileges for app_ro
GRANT CONNECT ON DATABASE my_starter_kit_db to app_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_ro;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO app_ro;
GRANT USAGE ON SCHEMA public TO app_ro;

-- Set up privileges for app_rw
GRANT CONNECT ON DATABASE my_starter_kit_db to app_rw;
GRANT SELECT, UPDATE, INSERT, DELETE ON ALL TABLES IN SCHEMA public TO app_rw;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO app_rw;
GRANT USAGE ON SCHEMA public TO app_rw;

-- Set up privileges for app_migrate
GRANT CONNECT ON DATABASE my_starter_kit_db to app_migrate;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_migrate;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO app_migrate;
GRANT ALL PRIVILEGES ON SCHEMA public TO app_migrate;

-- Set up privileges for app_ro (for new tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
   GRANT SELECT ON TABLES TO app_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
   GRANT SELECT ON SEQUENCES TO app_ro;

-- Set up privileges for app_rw (for new tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
   GRANT SELECT, UPDATE, INSERT, DELETE ON TABLES TO app_rw;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
   GRANT SELECT, UPDATE ON SEQUENCES TO app_rw;

-- Set up privileges for app_migrate (for new tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
   GRANT ALL PRIVILEGES ON TABLES TO app_migrate;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
   GRANT ALL PRIVILEGES ON SEQUENCES TO app_migrate;
