import { Page } from "puppeteer";
import Service, { IService } from "./Service";

export interface PostLikes {
  id?: string;
  totalLikes: number,
  totalLoaded: number,
  likes: any[];
}

interface ISocMedService extends IService {
  crawlPostLikes: (page: Page, postId: string) => Promise<PostLikes>;
}

export default class SocMedService extends Service<ISocMedService> {
  constructor(classInjector: ISocMedService) {
    super(classInjector);
  }

  async getPostLikes(postId: string) {
    const postLikes = await this.classInjector.crawlPostLikes(this.page as Page, postId);
    console.log(postLikes, 'the postLikes')
  }
}