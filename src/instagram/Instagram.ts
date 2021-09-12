import Sites, { ISitesWithCredentialsOptions } from "../interface/Sites";
import { Page } from "puppeteer";

interface IInstagram extends ISitesWithCredentialsOptions { }

export default class Instagram extends Sites {
  constructor(options: Omit<IInstagram, 'url'>) {
    super({
      ...options,
      url: 'https://instagram.com'
    } as ISitesWithCredentialsOptions);
  }

  get elementIDs() {
    return {
      fields: {
        username: 'input[name=username]',
        password: 'input[name=password]'
      },
      buttons: {
        loginSubmit: 'button[type=submit]',
      },
      section: {
        profileHeader: 'div[id=my-profile-header]'
      }
    }
  }

  async login(page: Page): Promise<void> {
    let signedIn = false;
    try {
      // Refresh the page, Instagram still need more time to load the session
      await page.goto(this.url, { waitUntil: 'networkidle2' });
      await page.waitForSelector(this.elementIDs.fields.username, {
        timeout: 2000
      });
    } catch (err) {
      signedIn = true;
    }

    if (!signedIn) {
      const userUsername = this.credentials?.username ?? await this.ioInput('Please input your username: => ');
      const userPassword = await this.ioInput('Please input your password: => ');

      await this.type(page, this.elementIDs.fields.username, userUsername);
      await this.type(page, this.elementIDs.fields.password, userPassword);
      await page.click(this.elementIDs.buttons.loginSubmit);

      const isValid = await this.validateCredentials(page);
      if (!isValid) {
        console.log('Invalid credentials, please try again!');
        throw new Error('Invalid credentials, please try again.');
      }

      if (this.is2faEnabled) {
        await this.request2faCode(page);
      }

      await page.waitForNavigation();

      await page.$eval('script[type="text/javascript"]', (element) => {
        const content = element.innerHTML;
        console.log(content, 'content');
        if (content.includes('window._sharedData')) {
          const userData = content.replace('window._sharedData = ', '');
          console.log(userData, 'user data');
        }
      });

      this.saveCookies(page);

      this.takeScreenshot(page, 'credentials-finished');
    }
  }

  async validateCredentials(page: Page) {
    try {
      await page.waitForSelector('p[id=slfErrorAlert]', {
        timeout: 2000
      });
      return false;
    } catch (err) {
      return true;
    }
  }

  async request2faCode(page: Page): Promise<void> { }
}