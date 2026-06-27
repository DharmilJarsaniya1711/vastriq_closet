import { Menu } from '@mantine/core';
import { deleteCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useMe } from '@/apis/queries/auth.queries';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/utils/constants';

// Auth-aware header control: "Login" when signed out, a profile menu when signed in.
const HeaderAuth = () => {
  const { data: user } = useMe();
  const router = useRouter();

  if (!user) {
    return (
      <Link href="/login" className="text-sm font-medium text-primary-900 hover:underline">
        Login
      </Link>
    );
  }

  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.phone || 'My account';

  const logout = () => {
    deleteCookie(ACCESS_TOKEN);
    deleteCookie(REFRESH_TOKEN);
    router.reload();
  };

  return (
    <Menu width={180} position="bottom-end" withArrow>
      <Menu.Target>
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-primary-900 hover:underline"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-900 text-xs text-cream-50">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="hidden max-w-[120px] truncate md:inline">{name}</span>
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component={Link} href="/account">
          My account
        </Menu.Item>
        <Menu.Item component={Link} href="/wishlist">
          My wishlist
        </Menu.Item>
        <Menu.Item component={Link} href="/owner/listings">
          My listings
        </Menu.Item>
        <Menu.Item color="red" onClick={logout}>
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default HeaderAuth;
