import { Creator, Reaction } from "../shared";

export interface SubPostComment {
  _id: string;
  text: string;
  subPostId: string;
  creator: {
    id: string;
  };
  date: Date;
  reactions: Reaction[];
  reactionCount: number;
  reaction: Reaction;
}

export interface SubPostCommentData {
  id: string;
  text: string;
  subPostId: string;
  creator: Creator;
  date: Date;
  formattedDate: String;
  reactionCount: number;
  reaction: Reaction;
}

export interface AddSubPostCommentReqBody {
  text: string;
  subPostId: string;
}

export interface AddSubPostCommentResBody {
  msg: string;
  data?: SubPostCommentData;
}

export interface ReactToSubPostCommentParams {
  commentId: string;
}

export interface GetSubPostCommentsQuery {
  pageNumber: string;
  pageSize: string;
}

export interface GetSubPostCommentsResBody {
  msg: string;
  commentCount: number;
  data: SubPostCommentData[];
}

export interface GetSubPostCommentCountResBody {
  msg: string;
  count?: number;
}
