import { Database } from "../interface/Database";
import { Page } from "puppeteer";
import Service, { IService } from "./Service";

export interface PostLikes {
  id?: string;
  pageInfo?: {
    hasNextPage: boolean;
    endCursor: string;
  },
  totalLikes: number,
  totalLoaded: number,
  likes: any[];
}

interface ISocMedService extends IService {
  crawlPostLikes: (page: Page, postId: string, endCursor?: string) => Promise<PostLikes>;
}

export default class SocMedService extends Service<ISocMedService> {
  private db: Database;

  constructor(classInjector: ISocMedService) {
    super(classInjector);

    this.db = new Database({
      dbName: classInjector.url.replace('https://', '')
    });
  }

  async getPostLikes(postId: string, after?: string) {
    let allLikes: any[] = [];
    const postLikes = await this.classInjector.crawlPostLikes(this.page as Page, postId, after);
    if (postLikes.totalLoaded) {
      allLikes = allLikes.concat(postLikes);
      if (postLikes.pageInfo?.hasNextPage) {
        const moreLikes = await this.getPostLikes(postId, postLikes.pageInfo.endCursor);
        if (moreLikes.length) {
          allLikes = allLikes.concat(moreLikes);
        }
      }
    }

    return allLikes;
  }

  async saveLikes(postId: string, items: any) {
    await this.db.put(`likes-${postId}`, items);
  }

  async getAllLikes(postId: string) {
    const data = await this.db.get(`likes-${postId}`);
    return data;
  }
}