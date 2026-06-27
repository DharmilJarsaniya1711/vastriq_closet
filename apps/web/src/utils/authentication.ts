import { getCookie } from 'cookies-next';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { IUser } from '../types';

import { ACCESS_TOKEN } from './constants';

type AuthOptions = {
  optional?: boolean;
};

export function withAuth<P extends { [key: string]: unknown } = { [key: string]: unknown }>(
  handler: (
    context: GetServerSidePropsContext & { req: { user?: IUser | null } }
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
  options?: AuthOptions
) {
  return async function checkJwtToken(
    context: GetServerSidePropsContext & { req: { user?: IUser | null } }
  ) {
    const accessToken = getCookie(ACCESS_TOKEN, context);

    if (!accessToken && !options?.optional) {
      return {
        redirect: {
          permanent: true,
          destination: '/',
        },
        props: {},
      };
    }

    if (!accessToken && options?.optional === true) {
      // eslint-disable-next-line no-param-reassign
      context.req.user = null;

      return handler({ ...context });
    }

    try {
      // TODO: fetch user from API
      // eslint-disable-next-line no-param-reassign
      context.req.user = null;

      return handler({ ...context });
    } catch (error) {
      return {
        redirect: {
          permanent: true,
          destination: '/',
        },
        props: {},
      };
    }
  };
}
