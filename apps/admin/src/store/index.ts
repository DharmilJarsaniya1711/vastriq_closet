import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { IUser } from '../types';

interface UserSlice {
  user?: IUser | null;
  updateUser: (user: Partial<IUser>) => void;
  removeUser: () => void;
}

interface DashboardLayoutSlice {
  mobileOpened: boolean;
  desktopOpened: boolean;
  sidebarCollapsed: boolean;
  mobileSidebarHandler: {
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
  desktopSidebarHandler: {
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
  sidebarHandler: {
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
}

type MergedStore = UserSlice & DashboardLayoutSlice;

const createUserSlice: StateCreator<MergedStore, [], [], UserSlice> = (set) => ({
  user: null,
  updateUser: (user) => set((state) => ({ user: { ...state.user, ...user } as IUser })),
  removeUser: () => set({ user: null }),
});

const createDashboardLayoutSlice: StateCreator<MergedStore, [], [], DashboardLayoutSlice> = (
  set
) => ({
  mobileOpened: false,
  desktopOpened: true,
  sidebarCollapsed: false,
  mobileSidebarHandler: {
    open: () => set({ mobileOpened: true }),
    close: () => set({ mobileOpened: false }),
    toggle: () => set((state) => ({ mobileOpened: !state.mobileOpened })),
  },
  desktopSidebarHandler: {
    open: () => set({ desktopOpened: true }),
    close: () => set({ desktopOpened: false }),
    toggle: () => set((state) => ({ desktopOpened: !state.desktopOpened })),
  },
  sidebarHandler: {
    open: () => set({ sidebarCollapsed: false }),
    close: () => set({ sidebarCollapsed: true }),
    toggle: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  },
});

const useZStore = create<MergedStore>()(
  devtools((...a) => ({
    ...createUserSlice(...a),
    ...createDashboardLayoutSlice(...a),
  }))
);

export default useZStore;
