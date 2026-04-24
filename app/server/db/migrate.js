//AI Generated Script
const fs = require("fs");
const path = require("path");
const db = require("./db");

const migrationsDir = path.join(__dirname, "migrations");

async function migrate() {
  try {
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      console.log(`Running ${file}...`);

      const statements = sql
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await db.query(statement);
      }
    }

    console.log("All migrations ran!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();