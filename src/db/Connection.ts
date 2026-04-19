import fs from "fs";
import path from "path";

export interface IConnection {
    path: string,
    state: "connected" | "disconnected",
    connectedAt: Date
}

export class Connection implements IConnection {
    public path: string;
    public state: "connected" | "disconnected";
    public connectedAt: Date;

    constructor (dbPath: string) {
        this.path = path.join(process.cwd(), dbPath);

        if (!fs.existsSync(this.path)) fs.mkdirSync(this.path, {recursive: true});

        this.state = "connected";
        this.connectedAt = new Date();
    }

    disconnect() {
        this.state = "disconnected";
    }
}

export function createConnection(dbPath: string): Connection {
    return new Connection(dbPath);
}