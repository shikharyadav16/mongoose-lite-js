const fs = require('fs');
const path = require('path');

function createConnection(dbPath) {

    const folderPath = `./VirtualMongoose/${dbPath}`;

    if (!fs.existsSync(dbPath)) fs.mkdirSync(folderPath, { recursive: true });

    return {
        path: folderPath,
        state:'connected',
        connectedAt: new Date(),

        saveFile(fileName, data) {
            const filePath = path.join(folderPath, fileName);
            fs.writeFileSync(filePath, data, "utf-8");
        },
        
        readFile(fileName) {
            const filePath = path.join(folderPath, fileName);
            return fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
        }
    }
}

module.exports = { createConnection };