import {Creator, Owner} from "./shared";

export default interface Notification {
  _id: string;
  creators: Creator[];
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
  image?: {
    thumbnail: {
      url: string;
      dUrl: string;
    };
  };
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
  image?: {
    thumbnail: {
      url: string;
    };
  };
}

export interface GetNotificationsRes {
  msg: string;
  count?: number;
  data?: NotificationRes[];
}
