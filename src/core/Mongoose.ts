import { createConnection } from "../db/Connection.js";
import { createSchema, Schema } from "./Schema.js";
import { createModel } from "./Model.js";
import type { IConnection } from "../db/Connection.js";

interface IMongoose {
    connections: IConnection[];
}

export default class Mongoose implements IMongoose {
    public connections: IConnection[] = [];

    connect(path: string): IConnection {
        const conn: IConnection = createConnection(path);
        this.connections.push(conn);
        console.log("[DB] Connected →", conn.path);
        return conn;
    }

    Schema<T extends Record<string, any>>(definition: T, options: Record<string, any> = {}): Schema<T> {
        return createSchema<T>(definition, options);
    }

    model<T extends Record<string, any>>(name: string, schema: Schema<T>, connection?: IConnection) {
        const conn = connection || this.connections[0];

        if (!conn) {
            throw new Error("No active connection. Call connect() first.");
        }

        return createModel<T>(name, schema, conn);
    }
}