export interface School {
  _id: string;
  fullName: string;
  shortName: string;
}

export interface AddSchoolData {
  fullName: string;
  shortName: string;
}

export interface SchoolData {
  id: string;
  fullName: string;
  shortName: string;
}

export interface GetSchoolsRes {
  msg: string;
  schoolCount: number;
  data: SchoolData[];
}
