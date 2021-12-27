import { Creator, Owner } from "./shared";

export default interface Notification {
  _id: string;
  creators: { id: string; name: string }[];
  subscriber: {
    id: string;
  };
  owners: Owner[];
  type: string;
  date: Date;
  phrase: string;
  contentId: string;
  payload?: string;
  seen: boolean;
}

export interface GetNotificationsQuery {
  pageNumber: string;
  pageSize: string;
}

export interface UpdateNotificationParams {
  notificationId: string;
}

export interface NotificationRes {
  id: string;
  creators: Creator[];
  type: string;
  owners: Owner[];
  date: Date;
  formattedDate: string;
  phrase: string;
  contentId: string;
  payload?: string;
  seen: boolean;
  image?: NotificationImage;
}

export interface GetNotificationsRes {
  msg: string;
  count?: number;
  data?: NotificationRes[];
}

export interface NotificationImage {
  thumbnail: { url: string; dUrl: string };
}
