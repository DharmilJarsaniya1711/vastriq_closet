import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';

import { IUser } from '../../../types';

import { generateDefaultFields } from './utils';

export const generateUser = () =>
  ({
    ...generateDefaultFields(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  }) satisfies IUser;

const userHandlers = [
  http.get('/user', () =>
    HttpResponse.json({
      data: {
        users: Array.from({ length: 10 }, generateUser),
      },
    })
  ),
  http.get('/user/:id', () => HttpResponse.json({ data: { user: generateUser() } })),
];

export default userHandlers;
