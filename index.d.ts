class Schema {
  private schema: Record<string, any>;
  constructor(schema: Record<string, any>): void;
  public validate(data: Schema): boolean;
}

interface DatabaseOptions {
  dbName: string;
  schema: Schema;
}

interface QueryOptions {
  id?: string;
  field?: string;
}

class JSONDatabase {
  private dbName: string;
  private schema: Schema;

  constructor(options: DatabaseOptions): void;
  private generateRandomId(): string;
  public set(data: any): void;
  public get(query: QueryOptions): unknown;
  public delete(query: QueryOptions): unknown;
  public has(query: QueryOptions): boolean;
  private getDataFromFile(): Array;
}

export { Schema, JSONDatabase };
