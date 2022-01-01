import { StudentData } from "./shared";

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
  studentData: StudentData;
  password: string;
  interests: string[];
  hobbies: string[];
  roles: string[];
  rubyBalance: number;
  messagingToken: string;
  paymentDetails: PaymentDetails;
}

export interface MofifiedUser {
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
  studentData: StudentData;
  rubyBalance: number;
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
  schoolId: string;
  facultyId: string;
  departmentId: string;
  level: string;
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

export interface PaymentDetails {
  bankName: string;
  bankSortCode: string;
  accountType: string;
  accountName: string;
  accountNumber: string;
  currency: string;
}

export interface UpdateMessagingTokenReqBody {
  messagingToken: string;
}

export interface VerifyUsernameReqBody {
  username: string;
}

export interface GetRubyBalanceResBody {
  msg: string;
  data: {
    balance: number;
  };
}
