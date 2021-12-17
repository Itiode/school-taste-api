import { Reaction } from "../shared";

export interface PostComment {
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

export interface AddPostCommentData {
  text: string;
  postId: string;
}

export interface ReactToPostCommentParams {
  commentId: string;
}

export interface GetPostCommentsQuery {
  pageNumber: string;
  pageSize: string;
}

export interface GetPostCommentsRes {
  msg: string;
  commentCount: number;
  data: PostComment[];
}

export interface GetPostCommentCountRes {
  msg: string;
  count?: number;
}
