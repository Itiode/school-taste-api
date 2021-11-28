import { SubPostRes } from "./sub-post";
import Reaction from "./reaction";

export interface Post {
  _id: string;
  creator: {
    name: string;
    id: string;
  };
  title: string;
  body: string;
  school: { fullName: string; shortName: string };
  studentData: { department: string; faculty: string; level: string };
  searchText: string;
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
  creator: {
    name: string;
    id: string;
  };
  title: string;
  body: string;
  subPosts: SubPostRes[];
  school: { fullName: string; shortName: string };
  studentData: { department: string; faculty: string; level: string };
  date: Date;
  reactionCount: number;
  reaction: Reaction;
  viewCount: number;
  commentCount: number;
}

export interface CreatePostReq {
  title: string;
  body: string;
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

export interface ReactToPostReq {
  reactionType: string;
}

export interface ReactToPostParams {
  postId: string;
}

export interface ViewPostParams {
  postId: string;
}
