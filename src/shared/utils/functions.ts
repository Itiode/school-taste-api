import moment from 'moment';

export function formatDate(date: string) {
    return moment(date).fromNow(); 
}

export function getNotificationPayload(payload: string) {
  return payload.length > 100 ? `${payload.slice(0, 97)}...` : payload;
}

export function isADayOld(date: string) {
  const currentDate = new Date();
  
}