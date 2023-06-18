import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs';
import { ChatData , ChatAccounts} from './entity.js';

class LowDb {
  private db: Low<ChatData>;

  constructor () {
    this.initDb()
  }

  private async initDb() {
    const __dirname = dirname(fileURLToPath(import.meta.url))
    const dbPath = __dirname.substring(0, __dirname.lastIndexOf("/") + 1) + '/db';
    const file = join(dbPath, 'db.json')

    if (!fs.existsSync(file)) {
      await this.createDbDir(dbPath)
    }

    console.log(file)
    const defaultData: ChatData = {chatAccounts: []}
    const adapter = new JSONFile<ChatData>(file)
    this.db = new Low(adapter, defaultData)

    await this.db.read()
  }

  private async createDbDir(dbPath: string): Promise<string> {

    await fs.promises.mkdir(dbPath, { recursive: true }).catch(console.error);
    return dbPath
  }

  public save(chatAccounts: ChatAccounts) {
    if (this.db && this.db.data) {
      this.db.data.chatAccounts.push(chatAccounts) 
      console.log(this.db.data)
      this.db.write()
    } else {
      console.log("No DB Instance")
    }
  }
}

export default new LowDb()