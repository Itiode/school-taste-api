import { Reaction } from "./shared";

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
  commentCount: number;
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
//   commentCount: number;
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
  commentCount: number;
  viewCount: number;
}

export interface ReactToSubPostData {
  reactionType: string;
}

export interface ReactToSubPostParams {
  subPostId: string;
}
