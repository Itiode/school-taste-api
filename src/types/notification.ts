export default interface Notification {
  _id: string;
  creators: {
    id: string;
    name: string;
  }[];
  subscriber: {
    id: string;
  };
  type: string;
  date: Date;
  phrase: string;
  payload?: string;
}

export interface GetNotificationsQuery {
  pageNumber: string;
  pageSize: string;
}

export interface NotificationRes {
  id: string;
  creators: {
    id: string;
    name: string;
  }[];
  type: string;
  date: Date;
  phrase: string;
  payload?: string;
}

export interface GetNotificationsRes {
  msg: string;
  count?: number;
  data?: NotificationRes[];
}
