import fs from 'fs';
import path from 'path';

export interface IDatabase {
  dbName: string;
}

const errCodes = ['ENOENT', 'EEXIST'];

export class Database {
  public dbName: string;

  get dbPath() {
    return path.resolve(`./db/${this.dbName}`);
  }

  constructor(options: IDatabase) {
    this.dbName = options.dbName;

    this.prepareDb();
  }

  private prepareDb() {
    try {
      fs.mkdirSync(path.resolve(this.dbPath));
    } catch (err: any) {
      if (err.code !== 'EEXIST') {
        // all setted up
        console.log(`Failed while preparing DB`, err);
      }
    }
  }

  async get(tableName: string) {
    console.log(`Trying to retrieving data`, tableName);

    try {
      const items = fs.readFileSync(`${this.dbPath}/${tableName}.json`);
      return JSON.parse(items.toString()) as any[];
    } catch (err: any) {
      if (!errCodes.includes(err.code)) {
        console.log(`Failed while retrieving data`, err);
      }
      return [];
    }
  }

  async put(tableName: string, items: []) {
    console.log('Trying to save data => ', tableName, items.length);

    // TODO at the moment we'll save the data as json file under db folder
    try {
      fs.writeFileSync(path.resolve(`${this.dbPath}/${tableName}.json`), JSON.stringify(items, null, 2));
      console.log(`Items saved. ${items.length}`);
    } catch (err: any) {
      console.log('error', err)
      if (!errCodes.includes(err.code)) {
        console.log(`Failed while saving data to database`, err);
      }
    }
  }
}