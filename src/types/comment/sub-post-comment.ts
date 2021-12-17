import { Reaction } from "../shared";

export interface SubPostComment {
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

export interface AddSubPostCommentData {
  text: string;
  subPostId: string;
}

export interface ReactToSubPostCommentParams {
  commentId: string;
}

export interface GetSubPostCommentsQuery {
  pageNumber: string;
  pageSize: string;
}

export interface GetSubPostCommentsRes {
  msg: string;
  commentCount: number;
  data: SubPostComment[];
}

export interface GetSubPostCommentCountRes {
  msg: string;
  count?: number;
}
