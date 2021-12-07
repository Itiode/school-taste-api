import { Reaction } from "./shared";

export default interface SubNews {
  _id: string;
  type: string;
  content: string;
  reactions: Reaction[];
  reactionCount: number;
  reaction: Reaction;
  views: string[];
  viewCount: number;
  commentCount: number;
}
