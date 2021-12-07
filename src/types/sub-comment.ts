import { Reaction } from "./shared";

export interface SubComment {
  _id: string;
  text: string;
  subPostId: string;
  creator: {
    id: string;
    name: string;
  };
  date: Date;
  reactions: Reaction[];
  reactionCount: number;
  reaction: Reaction;
}

export interface AddSubCommentData {
  text: string;
  subPostId: string;
}

export interface ReactToSubCommentParams {
  subCommentId: string;
}

export interface GetSubCommentsQuery {
  pageNumber: string;
  pageSize: string;
}

export interface GetSubCommentsRes {
  msg: string;
  subCommentCount: number;
  data: SubComment[];
}

export interface GetSubCommentCountRes {
  msg: string;
  count?: number;
}
