'use client';

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine,
  RiLineChartLine,
  RiShoppingBag3Line,
  RiGroupLine,
  RiFileChartLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiStore2Line,
} from 'react-icons/ri';
import { useFiltersStore } from '../../store/filtersStore';

const navItems = [
  { label: 'Dashboard', icon: RiDashboardLine, href: '/' },
  { label: 'Vendas', icon: RiLineChartLine, href: '/vendas' },
  { label: 'Produtos', icon: RiShoppingBag3Line, href: '/produtos' },
  { label: 'Clientes', icon: RiGroupLine, href: '/clientes' },
  { label: 'Relatórios', icon: RiFileChartLine, href: '/relatorios' },
];

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 70;

const Wrapper = styled(motion.aside)<{ $collapsed: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${({ $collapsed }) => ($collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH)}px;
  background: ${({ theme }) => theme.colors.sidebar};
  border-right: 1px solid ${({ theme }) => theme.colors.sidebarBorder};
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
  transition: width ${({ theme }) => theme.transitions.normal};

  @media (max-width: 768px) {
    transform: ${({ $collapsed }) => ($collapsed ? 'translateX(-100%)' : 'translateX(0)')};
    width: ${SIDEBAR_WIDTH}px;
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

const Logo = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: ${({ $collapsed }) => ($collapsed ? '20px 16px' : '20px 20px')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.sidebarBorder};
  min-height: 64px;
  overflow: hidden;
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
`;

const LogoText = styled(motion.div)`
  overflow: hidden;
  white-space: nowrap;
`;

const LogoTitle = styled.span`
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.3px;
`;

const LogoSubtitle = styled.span`
  display: block;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.sidebarText};
  font-weight: 400;
  margin-top: 1px;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const NavItem = styled.a<{ $active?: boolean; $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${({ $collapsed }) => ($collapsed ? '10px 16px' : '10px 14px')};
  border-radius: ${({ theme }) => theme.radii.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  margin-bottom: 4px;
  position: relative;
  text-decoration: none;
  background: ${({ $active, theme }) => ($active ? theme.colors.sidebarActive : 'transparent')};
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};

  &:hover {
    background: ${({ theme }) => theme.colors.sidebarActive};
  }
`;

const NavIcon = styled.div<{ $active?: boolean }>`
  font-size: 20px;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.sidebarText)};
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color ${({ theme }) => theme.transitions.fast};

  ${NavItem}:hover & {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NavLabel = styled(motion.span)<{ $active?: boolean }>`
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  color: ${({ $active, theme }) => ($active ? theme.colors.sidebarTextActive : theme.colors.sidebarText)};
  white-space: nowrap;
  overflow: hidden;
  transition: color ${({ theme }) => theme.transitions.fast};

  ${NavItem}:hover & {
    color: ${({ theme }) => theme.colors.sidebarTextActive};
  }
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 0 4px 4px 0;
`;

const Footer = styled.div`
  padding: 12px 8px;
  border-top: 1px solid ${({ theme }) => theme.colors.sidebarBorder};
`;

const CollapseButton = styled.button<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  gap: 10px;
  width: 100%;
  padding: ${({ $collapsed }) => ($collapsed ? '10px 16px' : '10px 14px')};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.sidebarText};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.sidebarActive};
    color: ${({ theme }) => theme.colors.sidebarTextActive};
  }

  svg {
    font-size: 20px;
    flex-shrink: 0;
  }
`;

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useFiltersStore();
  const activeHref = '/';

  return (
    <Wrapper $collapsed={sidebarCollapsed} layout>
      <Logo $collapsed={sidebarCollapsed}>
        <LogoIcon>
          <RiStore2Line />
        </LogoIcon>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <LogoText
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LogoTitle>E-commerce</LogoTitle>
              <LogoSubtitle>Insight Dashboard</LogoSubtitle>
            </LogoText>
          )}
        </AnimatePresence>
      </Logo>

      <Nav>
        {navItems.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <NavItem
              key={item.href}
              href={item.href}
              $active={isActive}
              $collapsed={sidebarCollapsed}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {isActive && (
                <ActiveIndicator
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <NavIcon $active={isActive}>
                <item.icon />
              </NavIcon>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <NavLabel
                    $active={isActive}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </NavLabel>
                )}
              </AnimatePresence>
            </NavItem>
          );
        })}
      </Nav>

      <Footer>
        <CollapseButton $collapsed={sidebarCollapsed} onClick={toggleSidebar}>
          {sidebarCollapsed ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Recolher menu
              </motion.span>
            )}
          </AnimatePresence>
        </CollapseButton>
      </Footer>
    </Wrapper>
  );
}
