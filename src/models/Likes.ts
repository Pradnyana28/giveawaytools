import { Database } from "../interface/Database";

export interface ILike {
  id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_private: boolean;
  is_verified: boolean;
  followed_by_viewer: boolean;
  requested_by_viewer: boolean;
  reel?: {
    id: string;
    expiring_at: number;
    has_pride_media: boolean;
    latest_reel_media: any;
    seen: any;
    owner: {
      __typename: string;
      id: string;
      profile_pic_url: string;
      username: string;
    }
  }
}

export default class Likes extends Database {
  async saveLikes(postId: string, items: any) {
    await this.put(`likes-${postId}`, items);
  }

  async getAllLikes(postId: string) {
    const data = await this.get(`likes-${postId}`);
    return data;
  }
}