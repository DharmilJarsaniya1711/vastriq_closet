import { InfiniteData } from '@tanstack/react-query';

import { ApiResponseWithPagination } from '../types';

export const transformInfiniteQuery = <T>(
  value?: InfiniteData<ApiResponseWithPagination<T[]>['data']>
) => value?.pages?.reduce((acc, { docs }) => [...acc, ...docs], [] as T[]) ?? [];
