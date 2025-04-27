import type { Browser } from "puppeteer";
import puppeteer from "puppeteer";
import { PuppeteerFileSystemService } from "./puppeteerFileSystem.service";

export class PuppeteerService {
  private browser: Browser | null = null;
  private puppeteerFileSystemService: PuppeteerFileSystemService;
  constructor() {
    this.puppeteerFileSystemService = new PuppeteerFileSystemService();
  }

  async launchBrowser() {
    if (this.browser) {
      return this.browser;
    }

    const browser = await puppeteer.launch({
      headless: !!0,
      defaultViewport: { width: 1920, height: 1080 },
      // defaultViewport: null,
      // userDataDir: this.fileSystem.puppeteerUserDataDir,
      ignoreDefaultArgs: ["--enable-automation"],
      args: [
        "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "--window-size=1920,1080",
        "--disable-blink-features=AutomationControlled",
        "--disable-gpu",
        "--no-sandbox",
      ],
      ...(process.env.PUPPETEER_EXECUTABLE_PATH
        ? {
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
          }
        : {}),
    });
    this.browser = browser;
    await this.supplyCookies();
    return this.browser;
  }

  async supplyCookies() {
    const cookies = await this.puppeteerFileSystemService.getCookieContent();
    if (cookies) {
      await this.browser?.setCookie(...cookies);
    }
  }

  async saveCookies() {
    const cookies = await this.browser?.cookies();
    if (!cookies) {
      throw new Error("No cookies found");
    }
    await this.puppeteerFileSystemService.saveCookieContent(cookies);
  }

  async closeBrowser() {
    if (this.browser) {
      await this.saveCookies();
      await this.browser.close();
    }
  }
}
