export function getNotificationPayload(payload: string) {
  return payload.length > 100 ? `${payload.slice(0, 97)}...` : payload;
}