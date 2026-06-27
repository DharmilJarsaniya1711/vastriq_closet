import authHandlers from './auth.mock';
import userHandlers from './user.mock';

const handlers = [...authHandlers, ...userHandlers];

export default handlers;
