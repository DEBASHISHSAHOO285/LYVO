const db = require("./database/database");

const result = db
  .prepare(
    "UPDATE conversations SET model = 'openrouter/free' WHERE model IS NULL OR model = 'openai/gpt-5.2'"
  )
  .run();

console.log("Updated conversations:", result.changes);

db.close();