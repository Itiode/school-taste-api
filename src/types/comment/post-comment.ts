import { Reaction, Creator } from "../shared";

export interface PostComment {
  _id: string;
  text: string;
  postId: string;
  creator: { id: string };
  date: Date;
  reactions: Reaction[];
  reactionCount: number;
  reaction: Reaction;
}

export interface PostCommentData {
  id: string;
  text: string;
  postId: string;
  creator: Creator;
  date: Date;
  formattedDate: string;
  reactionCount: number;
  reaction: Reaction;
}

export interface AddPostCommentReqBody {
  text: string;
  postId: string;
}

export interface AddPostCommentResBody {
  msg: string;
  data?: PostCommentData;
}

export interface ReactToPostCommentParams {
  commentId: string;
}

export interface GetPostCommentsQuery {
  pageNumber: string;
  pageSize: string;
}

export interface GetPostCommentsResBody {
  msg: string;
  commentCount: number;
  data: PostCommentData[];
}

export interface GetPostCommentCountResBody {
  msg: string;
  count?: number;
}
