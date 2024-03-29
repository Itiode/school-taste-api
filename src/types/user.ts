import { CourseMate, Image, StudentData } from "./shared";

export interface User {
  _id: string;
  name: Name;
  username: string;
  email: string;
  phone: string;
  gender: string;
  dob: DOB;
  about: string;
  profileImage: Image;
  coverImage: Image;
  studentData: StudentData;
  password: string;
  interests: string[];
  hobbies: string[];
  roles: string[];
  messagingToken: string;
}

export interface MofifiedUser {
  id: string;
  name: { first: string; last: string };
  username: string;
  email: string;
  phone: string;
  dob: { day: string; month: string; year: string };
  profileImage: Image;
  coverImage: Image;
  about: string;
  gender: string;
  studentData: StudentData;
}

export interface TempUser {
  id: string;
  fullName: string;
  userImage: Image;
}

export interface Name {
  first: string;
  last: string;
}

export interface DOB {
  day: string;
  month: string;
  year: string;
}

export interface AddUserReqBody {
  name: { first: string; last: string };
  username: string;
  email: string;
  phone: string;
  dob: { day: string; month: string; year: string };
  gender: string;
  schoolId: string;
  facultyId: string;
  departmentId: string;
  levelId: string;
  password: string;
}

export interface AuthResBody {
  msg: string;
  token?: string;
}

export interface AuthReqBody {
  email: string;
  password: string;
}

export interface GetUserResBody {
  msg: string;
  data?: MofifiedUser;
}

export interface AboutData {
  about: string;
}

export interface PhoneData {
  phone: string;
}

export interface UpdateFacultyReqBody {
  facultyId: string;
}

export interface UpdateDepReqBody {
  departmentId: string;
}

export interface UpdateLevelReqBody {
  levelId: string;
}

export interface UpdateMessagingTokenReqBody {
  messagingToken: string;
}

export interface VerifyUsernameReqBody {
  username: string;
}

export interface GetCourseMatesResBody {
  msg: string;
  data?: CourseMate[];
}
