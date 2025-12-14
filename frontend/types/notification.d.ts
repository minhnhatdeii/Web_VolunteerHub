export type NotificationType =
    | 'event_approved'
    | 'event_rejected'
    | 'registration_approved'
    | 'registration_rejected'
    | 'reminder'
    | 'announcement'
    | 'new_registration'
    | 'event_submitted';

export interface NotificationData {
    eventId?: string;
    eventTitle?: string;
    registrationId?: string;
    [key: string]: any;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    data?: NotificationData;
    sentAt: string;
    createdAt: string;
}

export interface NotificationResponse {
    success: boolean;
    data: Notification[];
    pagination?: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface UnreadCountResponse {
    success: boolean;
    data: {
        count: number;
    };
}
