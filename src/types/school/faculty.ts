export interface Faculty {
  _id: string;
  name: string;
}

export interface AddFacultyReqBody {
  name: string;
}

export interface GetFacultiesRes {
  msg: string;
  facultyCount: number;
  data: { name: string }[];
}
