import { SubPostRes } from "./sub-post";
import { Creator, Reaction } from "./shared";

export interface Post {
  _id: string;
  creator: {
    id: string;
  };
  text: string;
  school: { fullName: string; shortName: string };
  studentData: { department: string; faculty: string; level: string };
  tagsString: string;
  tags: string[];
  date: Date;
  reactions: Reaction[];
  reactionCount: number;
  reaction: Reaction;
  views: string[];
  viewCount: number;
  commentCount: number;
}

export interface PostRes {
  id: string;
  creator: Creator;
  text: string;
  subPosts: SubPostRes[];
  school: { fullName: string; shortName: string };
  studentData: { department: string; faculty: string; level: string };
  date: Date;
  formattedDate: string;
  reactionCount: number;
  reaction: Reaction;
  viewCount: number;
  commentCount: number;
}

export interface CreatePostReq {
  text: string;
}

export interface GetPostsQuery {
  searchQuery: string;
  pageNumber: string;
  pageSize: string;
  schoolFullName: string;
}

export interface GetPostsRes {
  msg: string;
  postCount?: number;
  data?: PostRes[];
}

export interface GetPostParams {
  postId: string;
}

export interface GetPostRes {
  msg: string;
  data?: PostRes;
}

export interface ReactToPostReq {
  reactionType: string;
}

export interface ReactToPostParams {
  postId: string;
}

export interface ViewPostParams {
  postId: string;
}
