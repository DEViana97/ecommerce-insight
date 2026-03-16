'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiSunLine,
  RiMoonLine,
  RiBellLine,
  RiSearchLine,
  RiMenuLine,
  RiUser3Line,
  RiArrowDownSLine,
} from 'react-icons/ri';
import { useFiltersStore, Period } from '../../store/filtersStore';

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 70;

const TopbarWrapper = styled.header<{ $collapsed: boolean }>`
  position: fixed;
  top: 0;
  left: ${({ $collapsed }) => ($collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH)}px;
  right: 0;
  height: 64px;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  z-index: 90;
  transition: left ${({ theme }) => theme.transitions.normal};

  @media (max-width: 768px) {
    left: 0;
  }
`;

const MobileMenuBtn = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 20px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 8px 14px;
  flex: 1;
  max-width: 400px;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const SearchIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 16px;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  background: none;
  border: none;
  outline: none;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const PeriodSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 4px;

  @media (max-width: 480px) {
    display: none;
  }
`;

const PeriodBtn = styled.button<{ $active: boolean }>`
  padding: 5px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.inverse : theme.colors.text.secondary)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.primaryHover : theme.colors.surfaceHover)};
    color: ${({ $active, theme }) => ($active ? theme.colors.text.inverse : theme.colors.text.primary)};
  }
`;

const IconBtn = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 18px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const NotificationDot = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.danger};
  border: 2px solid ${({ theme }) => theme.colors.surface};
`;

const UserAvatar = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  border-radius: ${({ theme }) => theme.radii.full};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const AvatarCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`;

const UserInfo = styled.div`
  @media (max-width: 640px) {
    display: none;
  }
`;

const UserName = styled.span`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.2;
`;

const UserRole = styled.span`
  display: block;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '12M', value: '12m' },
];

export default function Topbar() {
  const { sidebarCollapsed, toggleSidebar, period, setPeriod, theme, toggleTheme, searchQuery, setSearchQuery } =
    useFiltersStore();

  return (
    <TopbarWrapper $collapsed={sidebarCollapsed}>
      <MobileMenuBtn onClick={toggleSidebar}>
        <RiMenuLine />
      </MobileMenuBtn>

      <SearchWrapper>
        <SearchIcon>
          <RiSearchLine />
        </SearchIcon>
        <SearchInput
          placeholder="Buscar pedidos, produtos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchWrapper>

      <Spacer />

      <PeriodSelector>
        {PERIOD_OPTIONS.map((opt) => (
          <PeriodBtn key={opt.value} $active={period === opt.value} onClick={() => setPeriod(opt.value)}>
            {opt.label}
          </PeriodBtn>
        ))}
      </PeriodSelector>

      <IconBtn onClick={toggleTheme} title="Alternar tema">
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? <RiSunLine /> : <RiMoonLine />}
          </motion.div>
        </AnimatePresence>
      </IconBtn>

      <IconBtn title="Notificações">
        <RiBellLine />
        <NotificationDot />
      </IconBtn>

      <UserAvatar>
        <AvatarCircle>
          <RiUser3Line />
        </AvatarCircle>
        <UserInfo>
          <UserName>Mateus Lima</UserName>
          <UserRole>Admin</UserRole>
        </UserInfo>
        <RiArrowDownSLine style={{ color: 'var(--text-muted)', fontSize: '14px' }} />
      </UserAvatar>
    </TopbarWrapper>
  );
}
