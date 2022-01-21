import { Reaction, Image } from "./shared";

export default interface SubPost {
  _id: string;
  type: string;
  ppid: string;
  item: Image;
  reactions: Reaction[];
  reactionCount: number;
  reaction: Reaction;
  views: string[];
  commentCount: number;
  viewCount: number;
}

export interface ModifiedSubPost {
  id: string;
  type: string;
  item: Image;
  ppid: string;
  reaction: Reaction;
  reactionCount: number;
  commentCount: number;
  viewCount: number;
}

export interface ReactToSubPostData {
  reactionType: string;
}

export interface ReactToSubPostParams {
  subPostId: string;
}
