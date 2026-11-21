export type Notification = {
  id: number;
  userId: number;
  actorId: number | null;
  type: string;
  message: string;
  isRead: boolean;
  listingId: number | null;
  createdAt: string;
  updatedAt: string;
  actor: {
    id: number,
    firstName: string,
    lastName: string,
    username: string,
    avatar: string | null
  } | null
};

export type NotificationResponse = {
    success: boolean,
    data: Notification[]
}

export type ReadNotificationResponse = {
    success: boolean,
    data: Notification
}

export type AllNotificationRead = {
    success: boolean,
    message: string
}
