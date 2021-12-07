import { Reaction } from "./shared";

export interface Comment {
  _id: string;
  text: string;
  postId: string;
  creator: {
    id: string;
    name: string;
  };
  date: Date;
  reactions: Reaction[];
  reactionCount: number;
  reaction: Reaction;
}

export interface AddCommentData {
  text: string;
  postId: string;
}

export interface ReactToCommentParams {
  commentId: string;
}

export interface GetCommentsQuery {
  pageNumber: string;
  pageSize: string;
}

export interface GetCommentsRes {
  msg: string;
  commentCount: number;
  data: Comment[];
}

export interface GetCommentCountRes {
  msg: string;
  count?: number;
}
