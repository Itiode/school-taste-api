import { SchoolData } from "./student-data/school";
import { FacultyData } from "./student-data/faculty";
import { DepartmentData } from "./student-data/department";

export interface SimpleParams {
  userId: string;
}

export interface SimpleRes {
  msg: string;
}

export interface Image {
  thumbnail: { url: string; dUrl: string };
  original: { url: string; dUrl: string };
  metadata: Metadata;
}

export interface Metadata {
  width: number;
  height: number;
}

export interface CompressedImage {
  format: string;
  width: number;
  height: number;
  channels: number;
  premultiplied: boolean;
  size: number;
  path: string;
  name: string;
}

export interface StudentData {
  school: SchoolData;
  department: DepartmentData;
  faculty: FacultyData;
  level: string;
}

export interface CourseMate {
  id: string;
  fullName: string;
  profileImageUrl: string;
}

export interface Creator {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Owner {
  id: string;
  name: string;
}

export interface Reaction {
  userId: string;
  type: string;
}

export interface GetImageParams {
  filename: string;
}
