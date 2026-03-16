'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RiCalendarLine } from 'react-icons/ri';
import FiltersBar from '../../components/FiltersBar';
import DashboardContent from './DashboardContent';
import { useFiltersStore } from '../../store/filtersStore';

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const TitleBlock = styled.div``;

const PageTitle = styled(motion.h1)`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.5px;
`;

const PageSubtitle = styled(motion.p)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PERIOD_LABELS: Record<string, string> = {
  '7d': 'últimos 7 dias',
  '30d': 'últimos 30 dias',
  '12m': 'últimos 12 meses',
};

export default function DashboardPage() {
  const period = useFiltersStore((s) => s.period);

  return (
    <>
      <PageHeader>
        <TitleBlock>
          <PageTitle
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Dashboard
          </PageTitle>
          <PageSubtitle
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <RiCalendarLine />
            Visão geral dos {PERIOD_LABELS[period]}
          </PageSubtitle>
        </TitleBlock>
        <FiltersBar />
      </PageHeader>

      <DashboardContent />
    </>
  );
}
