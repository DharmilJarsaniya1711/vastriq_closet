import { notifications } from '@mantine/notifications';

import { ApiResponseError } from '@/apis/http';

const onApiError = (error: ApiResponseError) => {
  notifications.show({
    title: 'Error',
    message: error?.message,
    color: 'red',
  });
};

export default onApiError;
