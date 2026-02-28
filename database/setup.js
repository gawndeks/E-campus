const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.sqlite');

function setupDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                return reject(err);
            }
        });

        db.serialize(() => {
            // Create Notices Table
            db.run(`
                CREATE TABLE IF NOT EXISTS notices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    type TEXT NOT NULL,
                    date TEXT NOT NULL
                )
            `);

            // Create Enquiries Table
            db.run(`
                CREATE TABLE IF NOT EXISTS enquiries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    studentName TEXT NOT NULL,
                    parentName TEXT NOT NULL,
                    email TEXT NOT NULL,
                    phone TEXT NOT NULL,
                    classApplying TEXT NOT NULL,
                    message TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Create Contacts Table
            db.run(`
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    message TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Seed initial notice if empty
            db.get("SELECT COUNT(*) as count FROM notices", (err, row) => {
                if (!err && row.count === 0) {
                    const stmt = db.prepare("INSERT INTO notices (title, content, type, date) VALUES (?, ?, ?, ?)");

                    const notices = [
                        ['Terminal Exam Schedule for Grades 6-10', 'The date sheet for the upcoming terminal examinations has been released.', 'Examination', '15 Oct'],
                        ['Annual Sports Meet 2026', 'Join us for the Annual Sports Meet. Parents are cordially invited.', 'Event', '10 Oct'],
                        ['Holiday Notice: Gandhi Jayanti', 'School will remain closed on 2nd October.', 'General', '02 Oct']
                    ];

                    notices.forEach(n => stmt.run(n));
                    stmt.finalize();
                }
            });

            resolve(db);
        });
    });
}

// Helper function to get DB instance
function getDb() {
    return new sqlite3.Database(dbPath);
}

module.exports = setupDatabase;
module.exports.getDb = getDb;
