export interface IDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type StripDocument<T extends IDocument> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type ObjectValues<T> = T[keyof T];

export type TransformFileInput<T, P extends keyof T> = Omit<T, P> & {
  [K in P]: File;
};

export type ReplaceFileForYup<T, P extends keyof T> = Omit<T, P> & {
  [K in P]: unknown;
};

export interface IPaginatedQuery {
  page: number;
  limit: number;
  orderBy?: string;
}

export interface IPagination {
  limit: number;
  page: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type ApiResponseWithPagination<T> = {
  data: {
    docs: T;
    pagination?: IPagination;
  };
  message?: string;
};

export type ITokens = {
  accessToken: string;
  refreshToken: string;
};
