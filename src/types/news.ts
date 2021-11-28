import Reaction from './reaction';
import SubNews from './sub-news';

export interface News {
  _id: string;
  author: {
    name: string;
    id: string;
  };
  title: string;
  body: string;
  subNews: SubNews[];
  school: { fullName: string; shortName: string };
  studentData: { department: string; faculty: string; level: string };
  searchText: string;
  tags: string[];
  date: Date;
  reactionCount: number;
  reaction: Reaction;
  viewCount: number;
  commentCount: number;
}
