export interface Department {
  _id: string;
  name: string;
}

export interface DepartmentData {
  id: string;
  name: string;
}

export interface AddDepReqBody {
  name: string;
}

export interface GetDepsResBody {
  msg: string;
  departmentCount: number;
  data: { id: string; name: string }[];
}
