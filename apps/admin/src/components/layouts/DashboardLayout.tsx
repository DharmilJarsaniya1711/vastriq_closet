import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Group,
  Menu,
  NavLink,
  ScrollArea,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useQueryClient } from '@tanstack/react-query';

import useZStore from '../../store';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../utils/constants';
import { getNameInitials, normalizeName } from '../../utils/strings';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: 'tabler:layout-dashboard' },
  { to: '/dashboard/users', label: 'Users', icon: 'tabler:users' },
  { to: '/dashboard/outfits', label: 'Listings', icon: 'tabler:hanger' },
  { to: '/dashboard/reports', label: 'Reports', icon: 'tabler:flag' },
  { to: '/dashboard/contact', label: 'Contact', icon: 'tabler:mail' },
  { to: '/dashboard/reviews', label: 'Reviews', icon: 'tabler:star' },
  { to: '/dashboard/catalog', label: 'Catalog Master', icon: 'tabler:tags' },
  { to: '/dashboard/cms', label: 'CMS / Banners', icon: 'tabler:photo' },
  { to: '/dashboard/settings', label: 'Settings', icon: 'tabler:settings' },
];

const DashboardLayout = () => {
  const {
    mobileOpened,
    desktopOpened,
    mobileSidebarHandler,
    desktopSidebarHandler,
    user,
    removeUser,
  } = useZStore();

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    modals.openConfirmModal({
      title: 'Logout',
      children: (
        <p className="text-sm">
          Are you sure you want to logout? You will be redirected to the login page.
        </p>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      centered: true,
      onConfirm: () => {
        queryClient.clear();
        removeUser();
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        navigate('/');
      },
    });
  };

  return (
    <AppShell
      header={{ height: 64 }}
      transitionDuration={300}
      navbar={{
        width: desktopOpened ? 260 : 80,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      styles={{
        main: { backgroundColor: '#FAF7F0' },
        header: { backgroundColor: '#FAF7F0', borderBottom: '1px solid rgba(212,175,55,0.3)' },
        navbar: { backgroundColor: '#FFFDF9', borderRight: '1px solid rgba(212,175,55,0.3)' },
      }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={mobileSidebarHandler.toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={desktopSidebarHandler.toggle}
              visibleFrom="sm"
              size="sm"
            />
            <span className="vc-wordmark text-base text-primary-900">Vastriq Closet</span>
            <span className="text-xs text-gray-400">Admin Console</span>
          </Group>

          <Menu>
            <Menu.Target>
              <Group gap="xs" style={{ cursor: 'pointer' }}>
                <Avatar color="primary" radius="xl" size="sm">
                  {getNameInitials({ firstName: user?.firstName, lastName: user?.lastName })}
                </Avatar>
                <div className="hidden text-right md:block">
                  <p className="text-xs font-medium text-primary-900">
                    {normalizeName({ firstName: user?.firstName, lastName: user?.lastName })}
                  </p>
                  <p className="text-[10px] text-gray-400">{user?.email}</p>
                </div>
                <ActionIcon variant="subtle">
                  <Icon icon="tabler:chevron-down" />
                </ActionIcon>
              </Group>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<Icon icon="tabler:user-circle" />}>Profile</Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<Icon icon="tabler:logout" />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <AppShell.Section grow component={ScrollArea}>
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              active={location.pathname === n.to || (n.to !== '/dashboard' && location.pathname.startsWith(n.to))}
              label={desktopOpened ? n.label : ''}
              leftSection={<Icon icon={n.icon} width={20} />}
              onClick={() => navigate(n.to)}
              color="primary"
              variant="filled"
              styles={{ root: { borderRadius: 8 } }}
            />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
