const yaml = require("js-yaml");
const fs = require('fs');

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return yaml.load(fs.readFileSync(filePath, "utf-8")) || [];
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, yaml.dump(data), "utf-8");
}

module.exports = { readFile, writeFile };