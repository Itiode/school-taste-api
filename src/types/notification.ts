import Creator from "./creator";

export default interface Notification {
  _id: string;
  creators: Creator[];
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
  creators: Creator[];
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
