import { faker } from '@faker-js/faker';
import { delay, http, HttpResponse } from 'msw';

import { generateUser } from './user.mock';
import { API_URL } from './utils';

const authHandlers = [
  http.post(`${API_URL}/auth/login`, async () => {
    await delay(2000);
    return HttpResponse.json({
      data: {
        user: generateUser(),
        tokens: {
          accessToken: faker.string.alphanumeric(32),
          refreshToken: faker.string.alphanumeric(32),
        },
      },
    });
  }),
  http.get(`${API_URL}/auth/me`, async () => {
    await delay(2000);
    return HttpResponse.json({
      data: {
        user: generateUser(),
      },
    });
  }),
];

export default authHandlers;
