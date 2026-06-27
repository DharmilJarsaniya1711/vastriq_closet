export const NOTIFICATION_QUEUE = [process.env.APP_NAME, process.env.APP_ENV, 'notification']
  .filter(Boolean)
  .join('');
