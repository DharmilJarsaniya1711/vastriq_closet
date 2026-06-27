import React from 'react';
import { AppShell } from '@mantine/core';

export interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => <AppShell>{children}</AppShell>;

export default AppLayout;
