export interface SimpleParams {
  userId: string;
}

export interface SimpleRes {
  msg: string;
}

export interface Creator {
  id: string;
  name: string;
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
