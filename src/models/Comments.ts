import { Database } from "../interface/Database";

export interface IComment {
  id: string;
  text: string;
  created_at: number;
  did_report_as_spam: boolean;
  owner: {
    id: string;
    is_verified: boolean;
    profile_pic_url: string;
    username: string;
  };
  viewer_has_liked: boolean;
  edge_liked_by: {
    count: number;
  };
  is_restricted_pending: boolean;
  edge_threaded_comments: {
    count: number;
    page_info: {
      has_next_page: boolean;
      end_cursor: string | null;
    },
    edges: { node: Omit<IComment, 'edge_threaded_comments'> }[];
  }
}

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