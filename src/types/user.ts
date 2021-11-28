import ProfileImage from "./profile-image";

export interface User {
  name: { first: string; last: string };
  username: string;
  email: string;
  phone: string;
  gender: string;
  dob: { day: string; month: string; year: string };
  about: string;
  profileImage: ProfileImage;
  school: { fullName: string; shortName: string };
  studentData: { department: string; faculty: string; level: string };
  password: string;
  interests: string[];
  hobbies: string[];
  roles: string[];
  rubies: number;
  messagingToken: string;
}

export interface AddUserReq {
  name: { first: string; last: string };
  username: string;
  email: string;
  phone: string;
  dob: { day: string; month: string; year: string };
  gender: string;
  studentData: { department: string; faculty: string; level: string };
  school: { fullName: string; shortName: string };
  password: string;
}

export interface AuthRes {
  msg: string;
  token?: string;
}

export interface AuthReq {
  email: string;
  password: string;
}

export interface GetUserRes {
  msg: string;
  data?: {
    id: string;
    name: { first: string; last: string };
    username: string;
    email: string;
    phone: string;
    dob: { day: string; month: string; year: string };
    gender: string;
    school: {
      shortName: string;
      fullName: string;
    };
    studentData: {
      department: string;
      faculty: string;
      lavel: string;
    };
    rubyBalance: number;
  };
}

export interface AboutData {
  about: string;
}

export interface UpdateStudentDataReq {
  department: string;
  faculty: string;
  level: string;
}

export interface UpdateMessagingTokenReq {
  messagingToken: string;
}
