import { PuppeteerService } from "@my/puppeteer-service/puppeteer.service";
import { Elysia } from "elysia";

const puppeteerService = new PuppeteerService();

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .get("/crawl-test", async () => {
    const browser = await puppeteerService.launchBrowser();
    const page = await browser.newPage();
    await page.goto("https://simplywall.st/dashboard");
    const content = await page.content();
    await puppeteerService.closeBrowser();
    return content;
  })
  .listen(3003);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
