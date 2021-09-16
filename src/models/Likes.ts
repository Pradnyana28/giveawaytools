import { Database } from "../interface/Database";

export default class Likes extends Database {
  async saveLikes(postId: string, items: any) {
    await this.put(`likes-${postId}`, items);
  }

  async getAllLikes(postId: string) {
    const data = await this.get(`likes-${postId}`);
    return data;
  }
}