import Sites, { ISitesWithCredentialsOptions } from "../interface/Sites";
import { Page } from "puppeteer";
import { CrawlResponse } from "services/SocMedService";
import { ioInput } from "../libs/utils";

interface IInstagram extends ISitesWithCredentialsOptions { }

interface GraphResponse {
  data: any;
  status: string;
}

export default class Instagram extends Sites {
  private graphqlHost = 'https://www.instagram.com/graphql/query';

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

  private get queryHash() {
    return {
      likes: 'd5d763b1e2acf209d62d22d184488e57',
      comments: 'bc3296d1ce80a24b1b6e40b1e72903f5'
    }
  }

  async login(page: Page): Promise<void> {
    let signedIn = false;
    try {
      // Refresh the page, Instagram still need more time to load the session
      await page.goto(this.url, { waitUntil: 'networkidle2' });
      await page.waitForSelector(this.elementIDs.fields.username, {
        timeout: 750
      });
    } catch (err) {
      signedIn = true;
    }

    if (!signedIn) {
      const userUsername = this.credentials?.username ?? await ioInput('Please input your username: => ');
      const userPassword = await ioInput('Please input your password: => ');

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

  async crawlPostLikes(page: Page, postId: string, endCursor?: string): Promise<CrawlResponse> {
    const variables = { shortcode: postId, include_reel: true, first: 24, after: endCursor };
    await page.goto(this.constructUrl(this.queryHash.likes, variables), { waitUntil: 'networkidle2' });
    const pageContentHtml = await page.content();
    const { data: { shortcode_media } }: GraphResponse = this.convertToJson(pageContentHtml);
    return {
      id: shortcode_media.id,
      total: shortcode_media.edge_liked_by.count,
      totalLoaded: shortcode_media.edge_liked_by.edges.length,
      data: this.mapLikesData(shortcode_media.edge_liked_by.edges),
      pageInfo: {
        hasNextPage: shortcode_media.edge_liked_by.page_info.has_next_page,
        endCursor: shortcode_media.edge_liked_by.page_info.end_cursor
      }
    };
  }

  async crawlPostComments(page: Page, postId: string, endCursor?: string): Promise<any> {
    const variables = { shortcode: postId, first: 24, after: endCursor };
    await page.goto(this.constructUrl(this.queryHash.comments, variables), { waitUntil: 'networkidle2' });
    const pageContentHtml = await page.content();
    const { data: { shortcode_media } } = this.convertToJson(pageContentHtml);
    return {
      total: shortcode_media.edge_media_to_parent_comment.count,
      totalLoaded: shortcode_media.edge_media_to_parent_comment.edges.length,
      data: this.mapLikesData(shortcode_media.edge_media_to_parent_comment.edges),
      pageInfo: {
        hasNextPage: shortcode_media.edge_media_to_parent_comment.page_info.has_next_page,
        endCursor: shortcode_media.edge_media_to_parent_comment.page_info.end_cursor
      }
    };
  }

  constructUrl(queryHash: string, variables: Record<string, any>) {
    return `${this.graphqlHost}/?query_hash=${queryHash}&variables=${JSON.stringify(variables)}`;
  }

  mapLikesData(likes: any[]) {
    return likes.map((like) => like.node);
  }

  convertToJson(data: string) {
    try {
      return JSON.parse(data.replace('<html><head></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;">', '').replace('</pre></body></html>', ''))
    } catch (err) {
      console.log('Failed while converting data to json');
      return null;
    }
  }
}