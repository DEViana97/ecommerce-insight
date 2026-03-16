'use client';

import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useFiltersStore } from '../store/filtersStore';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 70;

const AppWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main<{ $collapsed: boolean }>`
  margin-left: ${({ $collapsed }) => ($collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH)}px;
  padding-top: 64px;
  min-height: 100vh;
  transition: margin-left ${({ theme }) => theme.transitions.normal};

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const PageContent = styled.div`
  padding: 24px;
  max-width: 1600px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const Overlay = styled.div<{ $visible: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $visible }) => ($visible ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 90;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
    transition: opacity 0.25s ease;
  }
`;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, toggleSidebar } = useFiltersStore();

  return (
    <AppWrapper>
      <Sidebar />
      <Overlay $visible={!sidebarCollapsed} onClick={toggleSidebar} />
      <Topbar />
      <MainContent $collapsed={sidebarCollapsed}>
        <PageContent>{children}</PageContent>
      </MainContent>
    </AppWrapper>
  );
}
