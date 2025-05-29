const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function setupTestDatabase() {
    try {
        // Set PostgreSQL password from environment
        process.env.PGPASSWORD = process.env.DB_TEST_PASSWORD;

        // Terminate existing connections
        execSync(`psql -U postgres -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'zikfreakdb_test' AND pid <> pg_backend_pid();"`, { stdio: 'inherit' });

        // Drop and recreate test database
        execSync(`dropdb -U postgres --if-exists zikfreakdb_test`, { stdio: 'inherit' });
        execSync(`createdb -U postgres zikfreakdb_test`, { stdio: 'inherit' });

        // Array of SQL files in order of execution
        const sqlFiles = [
            'villes.sql',
            'proprio_client.sql',
            'studios.sql',
            'studios_lln.sql'
        ];

        // Execute each SQL file
        for (const file of sqlFiles) {
            const filePath = path.join(__dirname, '../db/seeds', file);
            if (fs.existsSync(filePath)) {
                console.log(`Executing ${file}...`);
                execSync(`psql -U ${process.env.DB_TEST_USER} -d zikfreakdb_test -f ${filePath}`, {
                    stdio: 'inherit'
                });
            }
        }

        return true;
    } catch (error) {
        console.error('Error setting up test database:', error);
        return false;
    }
}

module.exports = setupTestDatabase;