import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { TUniqueId } from '../shared/types/type';
import { NOTIFICATION_QUEUE } from './queue.config';

export enum NotificationType {
  EMAIL,
  SMS,
  PUSH,
  IN_APP,
}

export interface INotificationRecipient {
  id: TUniqueId;
  firstName?: string;
  lastName?: string;
  email: string;
  contactNumber?: string;
}

export interface ISendNotificationOption {
  email?: {
    subject: string;
    from?: string;
    template: string;
    context: object;
    recipients: INotificationRecipient[];
  };
  push?: {
    title: string;
    body: string;
    recipients: INotificationRecipient[];
  };
  sms?: {
    body: string;
    recipients: INotificationRecipient[];
  };
  inApp?: {
    title: string;
    body: string;
    recipients: INotificationRecipient[];
    meta: object;
  };
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue
  ) {}
  async sendNotification(options: ISendNotificationOption) {
    await this.notificationQueue.add('add', options);
  }
}
