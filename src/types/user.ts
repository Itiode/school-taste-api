export interface User {
  name: Name;
  username: string;
  email: string;
  phone: string;
  gender: string;
  dob: DOB;
  about: string;
  profileImage: ProfileImage;
  school: School;
  studentData: StudentData;
  password: string;
  interests: string[];
  hobbies: string[];
  roles: string[];
  rubies: number;
  messagingToken: string;
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

export interface StudentData {
  department: string;
  faculty: string;
  level: string;
}

export interface School {
  fullName: string;
  shortName: string;
}

export interface ProfileImage {
  thumbnail: { url: string; dUrl: string };
  original: { url: string; dUrl: string };
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
    about: string;
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
