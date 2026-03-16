'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RiLightbulbFlashLine } from 'react-icons/ri';

interface InsightsPanelProps {
  insights: string[];
  loading?: boolean;
}

const Panel = styled(motion.section)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 20px 24px;
  display: grid;
  gap: 14px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
`;

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.warningLight};
  color: ${({ theme }) => theme.colors.warning};
  font-size: 16px;
`;

const List = styled.ul`
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Item = styled.li`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.45;
`;

const Dot = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13px;
`;

export default function InsightsPanel({ insights, loading = false }: InsightsPanelProps) {
  return (
    <Panel
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
    >
      <Header>
        <Icon>
          <RiLightbulbFlashLine />
        </Icon>
        <Title>Insights</Title>
      </Header>

      {loading ? (
        <Empty>Gerando insights com base nos filtros atuais...</Empty>
      ) : insights.length === 0 ? (
        <Empty>Sem variacoes relevantes para destacar neste periodo.</Empty>
      ) : (
        <List>
          {insights.map((insight) => (
            <Item key={insight}>
              <Dot>•</Dot>
              <span>{insight}</span>
            </Item>
          ))}
        </List>
      )}
    </Panel>
  );
}
