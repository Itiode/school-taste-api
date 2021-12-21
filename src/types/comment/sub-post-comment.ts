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

export interface SubPostCommentRes {
  id: string;
  text: string;
  subPostId: string;
  creator: {
    id: string;
    name: string;
  };
  date: Date;
  formattedDate: String;
  reactionCount: number;
  reaction: Reaction;
}

export interface AddSubPostCommentData {
  text: string;
  subPostId: string;
}

export interface AddSubPostCommentRes {
  msg: string;
  data?: SubPostCommentRes;
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
  data: SubPostCommentRes[];
}

export interface GetSubPostCommentCountRes {
  msg: string;
  count?: number;
}