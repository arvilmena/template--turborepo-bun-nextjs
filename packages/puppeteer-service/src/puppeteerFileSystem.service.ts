import path from "node:path";
import { FileSystemService } from "@my/fs-service/fileSystem.service";
import type { Cookie } from "puppeteer";
export class PuppeteerFileSystemService {
  private fileSystem: FileSystemService;

  constructor() {
    this.fileSystem = new FileSystemService();

    this.fileSystem.ensureDirExists(this.getUserDataDir());
    this.fileSystem.ensureFileExists(this.getCookieFilePath(), "[]");
  }

  getPuppeteerRootDir() {
    return path.join(this.fileSystem.APP_DATA_DIR_ABS_PATH, "puppeteer");
  }

  getUserDataDir() {
    return path.join(this.getPuppeteerRootDir(), "user-data");
  }

  getCookieFilePath() {
    return path.join(this.getPuppeteerRootDir(), "cookies", "cookies.json");
  }

  async getCookieContent() {
    const cookieFilePath = this.getCookieFilePath();
    const cookieContent = await this.fileSystem.readFile(cookieFilePath);
    if (!cookieContent || cookieContent.length === 0) return [];
    return JSON.parse(cookieContent) as Cookie[];
  }

  async saveCookieContent(cookies: Cookie[]) {
    const cookieFilePath = this.getCookieFilePath();
    await this.fileSystem.writeFile(cookieFilePath, JSON.stringify(cookies));
  }
}
