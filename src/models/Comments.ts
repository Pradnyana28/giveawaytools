import { Database } from "../interface/Database";

export default class Comments extends Database {
  async saveComments(postId: string, items: any) {
    await this.put(`comments-${postId}`, items);
  }

  async getAllComments(postId: string) {
    const data = await this.get(`comments-${postId}`);
    return data;
  }

  countTaggedPeople(text: string, validNumber: number) {
    return ((text || '').match(/@/g) || []).length === validNumber;
  }
}