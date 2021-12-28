import { School } from "./school";

export interface User {
  _id: string;
  name: Name;
  username: string;
  email: string;
  phone: string;
  gender: string;
  dob: DOB;
  about: string;
  profileImage: UserImage;
  coverImage: UserImage;
  school: School;
  studentData: StudentData;
  password: string;
  interests: string[];
  hobbies: string[];
  roles: string[];
  rubyBalance: number;
  messagingToken: string;
  paymentDetails: PaymentDetails;
}

export interface TempUser {
  id: string;
  fullName: string;
  userImage: UserImage;
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

export interface UserImage {
  thumbnail: { url: string; dUrl: string };
  original: { url: string; dUrl: string };
}

export interface AddUserReqBody {
  name: { first: string; last: string };
  username: string;
  email: string;
  phone: string;
  dob: { day: string; month: string; year: string };
  gender: string;
  studentData: { department: string; faculty: string; level: string };
  schoolId: string;
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
  data?: {
    id: string;
    name: { first: string; last: string };
    username: string;
    email: string;
    phone: string;
    dob: { day: string; month: string; year: string };
    profileImage: UserImage;
    coverImage: UserImage;
    about: string;
    gender: string;
    school: School;
    studentData: StudentData;
    rubyBalance: number;
  };
}

export interface AboutData {
  about: string;
}

export interface PhoneData {
  phone: string;
}

export interface PaymentDetails {
  bankName: string;
  bankSortCode: string;
  accountType: string;
  accountName: string;
  accountNumber: string;
  currency: string;
}

export interface UpdateStudentDataReqBody {
  department: string;
  faculty: string;
  level: string;
}

export interface UpdateMessagingTokenReqBody {
  messagingToken: string;
}

export interface CheckUsernameReqBody {
  username: string;
}

export interface GetRubyBalanceResBody {
  msg: string;
  data: {
    balance: number;
  };
}
