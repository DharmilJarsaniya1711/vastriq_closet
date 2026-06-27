type FormatPriceOptions = {
  locale?: string;
  style?: string;
  currency?: string;
};

export const formatPrice = (price: number, options?: FormatPriceOptions) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { locale = 'en-US', style = 'currency', currency = 'USD' } = options || ({} as any);

  return new Intl.NumberFormat(locale, {
    style,
    currency,
  }).format(price);
};

type TName = {
  firstName?: string;
  lastName?: string;
  middleName?: string;
};

export const normalizeName = ({ firstName, lastName, middleName }: TName) =>
  [firstName, middleName, lastName].filter((value) => value !== undefined).join(' ');
