import { Page } from "puppeteer";
import { ISitesObject } from "../interface/Sites";

export interface IService extends ISitesObject { }

export default class Service<T extends IService> {
  protected classInjector: T;
  public page: Page | undefined;

  constructor(classInjector: T) {
    this.classInjector = classInjector;
  }

  public async boot() {
    const CI = this.classInjector;
    await CI.checkSession();

    this.page = await CI.browser.newPage();

    try {
      await this.page.goto(CI.url, { waitUntil: 'networkidle2' });
      await this.page.waitForTimeout(1000);
      await CI.login(this.page);
    } catch (err) {
      console.log('The error', err);
    }

    return this.page;
  }
}

// fs.writeFileSync(path.resolve('./tokped.html'), pageContent);
// console.log('Page writed');
// console.log(pageTitle);

// let urls = await page.$$eval('section ol > li', links => {
//   // Make sure the book to be scraped is in stock
//   links = links.filter(link => link.querySelector('.instock.availability > i').textContent !== "In stock")
//   // Extract the links from the data
//   links = links.map(el => el.querySelector('h3 > a').href)
//   return links;
// });