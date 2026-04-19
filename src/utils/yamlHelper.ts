import yaml from "js-yaml";
import fs, { writeFileSync } from "fs";

export function readFile<T = any>(filePath: string): T[] {
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, "utf-8");
    const parsed = yaml.load(content);

    if (!Array.isArray(parsed)) return [];
    return parsed as T[];
}

export function writeFile<T>(filePath: string, data: T[]): void {
    const yamlStr = yaml.dump(data);
    writeFileSync(filePath, yamlStr, "utf-8");
}

