const fs = require("fs");
const path = require('path')

function createConnection(dbPath) {
  const folderPath = path.join(process.cwd(), dbPath);
  if (!fs.existsSync(dbPath)) fs.mkdirSync(folderPath, { recursive: true });

  return {
    path: folderPath,
    state: "connected",
    connectedAt: new Date(),
  };
}

module.exports = { createConnection };
