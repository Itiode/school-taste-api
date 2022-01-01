import { ModifiedSubPost } from "./sub-post";
import { Creator, Reaction } from "./shared";
import { StudentData } from "./shared";

export interface Post {
  _id: string;
  creator: {
    id: string;
  };
  text: string;
  studentData: StudentData;
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

export interface ModifiedPost {
  id: string;
  creator: Creator;
  text: string;
  subPosts: ModifiedSubPost[];
  studentData: StudentData;
  date: Date;
  formattedDate: string;
  reactionCount: number;
  reaction: Reaction;
  viewCount: number;
  commentCount: number;
}

export interface CreatePostReqBody {
  text: string;
}

export interface GetPostParams {
  postId: string;
}

export interface GetMyPostsParams {
  userId: string;
}

export interface GetPostsQuery {
  searchQuery: string;
  pageNumber: string;
  pageSize: string;
  schoolFullName: string;
}

export interface GetPostsResBody {
  msg: string;
  postCount?: number;
  data?: ModifiedPost[];
}

export interface GetPostResBody {
  msg: string;
  data?: ModifiedPost;
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
