import Reaction from "./reaction";

export default interface SubPost {
  _id: string;
  type: string;
  ppid: string;
  url: string;
  dUrl: string;
  reactions: Reaction[];
  reactionCount: number;
  reaction: Reaction;
  views: string[];
  subCommentCount: number;
  viewCount: number;
}

// export default interface SubPost {
//   _id: string;
//   type: string;
//   ppid: string;
//   url: { original: string; thumbnail: string };
//   dUrl: { original: string; thumbnail: string };
//   reactions: Reaction[];
//   reactionCount: number;
//   reaction: Reaction;
//   views: string[];
//   subCommentCount: number;
//   viewCount: number;
//   metadata: {
//     width: number;
//     height: number;
//   };
// }

export interface SubPostRes {
  id: string;
  type: string;
  url: string;
  dUrl?: string;
  reaction: Reaction;
  reactionCount: number;
  subCommentCount: number;
  viewCount: number;
}

export interface ReactToSubPostData {
  reactionType: string;
}

export interface ReactToSubPostParams {
  subPostId: string;
}
