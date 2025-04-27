import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { FILE_SYSTEM_CONFIG } from "./fileSystem.config";

export class FileSystemService {
  APP_DIR_ROOT_ABS_PATH: string;
  APP_DATA_DIR_ABS_PATH: string;

  constructor() {
    this.APP_DIR_ROOT_ABS_PATH = FILE_SYSTEM_CONFIG.APP_ROOT_DIR_ABS_PATH;
    this.APP_DATA_DIR_ABS_PATH = path.join(this.APP_DIR_ROOT_ABS_PATH, "data");
  }

  async ensureDirExists(dirPath: string) {
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true });
    }
  }

  async ensureFileExists(filePath: string, fileContent?: string) {
    const f = Bun.file(filePath);
    if (!(await f.exists())) {
      await Bun.write(filePath, fileContent ?? "", { createPath: true });
    }
  }

  async readFile(filePath: string) {
    const f = Bun.file(filePath);
    return await f.text();
  }

  async writeFile(filePath: string, fileContent: string) {
    const f = Bun.file(filePath);
    await f.write(fileContent);
  }
}
