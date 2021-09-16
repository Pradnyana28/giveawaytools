import { Page } from "puppeteer";
import Service, { IService } from "./Service";

export interface CrawlResponse {
  id?: string;
  pageInfo?: {
    hasNextPage: boolean;
    endCursor: string;
  },
  total: number,
  totalLoaded: number,
  data: any[];
}

interface ISocMedService extends IService {
  crawlPostLikes: (page: Page, postId: string, endCursor?: string) => Promise<CrawlResponse>;
  crawlPostComments: (page: Page, postId: string, endCursor?: string) => Promise<CrawlResponse>;
}

export default class SocMedService extends Service<ISocMedService> {
  constructor(classInjector: ISocMedService) {
    super(classInjector);
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

  async getPostComments(postId: string, after?: string) {
    let allComments: any[] = [];
    const postComments = await this.classInjector.crawlPostComments(this.page as Page, postId, after);
    if (postComments.totalLoaded) {
      allComments = allComments.concat(postComments);
      if (postComments.pageInfo?.hasNextPage) {
        const moreComments = await this.getPostComments(postId, postComments.pageInfo.endCursor);
        if (moreComments.length) {
          allComments = allComments.concat(moreComments);
        }
      }
    }

    return allComments;
  }
}