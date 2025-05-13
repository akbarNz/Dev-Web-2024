const { execSync } = require('child_process');
require('dotenv').config();

async function resetTestDatabase() {
    try {
        // Set PostgreSQL password from environment
        process.env.PGPASSWORD = process.env.DB_TEST_PASSWORD;

        // Terminate existing connections
        execSync(`psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'zikfreakdb_test' AND pid <> pg_backend_pid();"`, { stdio: 'inherit' });

        // Drop and recreate database
        execSync('dropdb -U anzeyima zikfreakdb_test --if-exists', { stdio: 'inherit' });
        execSync('createdb -U anzeyima zikfreakdb_test', { stdio: 'inherit' });

        // Apply schema
        execSync('psql -U anzeyima -d zikfreakdb_test -f src/db/seeds/zfdb.sql', { stdio: 'inherit' });

        // Clear password from environment
        delete process.env.PGPASSWORD;

        // Run test seeds
        execSync('npm run seed:test', { stdio: 'inherit' });

        console.log('Test database reset successful');
    } catch (error) {
        // Ensure password is cleared even if an error occurs
        delete process.env.PGPASSWORD;
        console.error('Error resetting test database:', error);
        process.exit(1);
    }
}

resetTestDatabase();