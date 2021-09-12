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
  constructor(classInjector: ISocMedService) {
    super(classInjector);
  }

  async getPostLikes(postId: string, after?: string) {
    let allLikes: any[] = [];
    const postLikes = await this.classInjector.crawlPostLikes(this.page as Page, postId, after);
    if (postLikes.totalLoaded) {
      allLikes = allLikes.concat(postLikes.likes);
      if (postLikes.pageInfo?.hasNextPage) {
        const moreLikes = await this.getPostLikes(postId, postLikes.pageInfo.endCursor);
        if (moreLikes.length) {
          allLikes = allLikes.concat(moreLikes);
        }
      }
    }

    return allLikes;
  }
}