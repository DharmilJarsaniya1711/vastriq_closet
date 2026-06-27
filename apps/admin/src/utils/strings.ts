type FormatPriceOptions = {
  locale?: string;
  style?: Intl.NumberFormatOptions['style'];
  currency?: string;
};

export const formatPrice = (price: number, options?: FormatPriceOptions) => {
  const { locale = 'en-US', style = 'currency', currency = 'USD' } = options || {};

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

export const getNameInitials = ({ firstName, lastName, middleName }: TName) =>
  [firstName, middleName, lastName]
    .filter(Boolean)
    .map((name) => name?.charAt(0))
    .join('');
