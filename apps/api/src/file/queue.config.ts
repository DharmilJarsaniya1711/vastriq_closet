export const PREVIEW_UPLOAD_QUEUE = [process.env.APP_NAME, process.env.APP_ENV, 'preview-upload']
  .filter(Boolean)
  .join('');

export const DELETE_FILE_QUEUE = [process.env.APP_NAME, process.env.APP_ENV, 'delete-file']
  .filter(Boolean)
  .join('');
