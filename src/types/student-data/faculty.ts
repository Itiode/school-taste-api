export interface Faculty {
  _id: string;
  name: string;
}

export interface FacultyData {
  id: string;
  name: string;
}

export interface AddFacultyReqBody {
  name: string;
}

export interface GetFacultiesResBody {
  msg: string;
  facultyCount: number;
  data: { id: string; name: string }[];
}
