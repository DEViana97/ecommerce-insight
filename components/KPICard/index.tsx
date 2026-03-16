'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';

interface KPICardProps {
  title: string;
  value: string;
  growth: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: 'primary' | 'success' | 'warning' | 'info';
  delay?: number;
  loading?: boolean;
}

const colorMap = {
  primary: { bg: 'primaryLight', color: 'primary' },
  success: { bg: 'successLight', color: 'success' },
  warning: { bg: 'warningLight', color: 'warning' },
  info: { bg: 'infoLight', color: 'info' },
};

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: default;
  transition: box-shadow ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.borderLight};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CardTitle = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.3px;
  text-transform: uppercase;
`;

const IconWrapper = styled.div<{ $color: string; $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $bg }) => (theme.colors as unknown as Record<string, string>)[$bg]};
  color: ${({ theme, $color }) => (theme.colors as unknown as Record<string, string>)[$color]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const CardValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -1px;
  line-height: 1;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ChangeIndicator = styled.div<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $positive, theme }) => ($positive ? theme.colors.success : theme.colors.danger)};
  background: ${({ $positive, theme }) => ($positive ? theme.colors.successLight : theme.colors.dangerLight)};
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.radii.full};
`;

const NeutralIndicator = styled(ChangeIndicator)`
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.surfaceHover};
`;

const ChangeLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SkeletonPulse = styled(motion.div)`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.border} 25%,
    ${({ theme }) => theme.colors.surfaceHover} 50%,
    ${({ theme }) => theme.colors.border} 75%
  );
  background-size: 200% 100%;
  border-radius: ${({ theme }) => theme.radii.sm};
`;

export default function KPICard({ title, value, growth, trend, icon: Icon, color, delay = 0, loading }: KPICardProps) {
  const { bg, color: colorKey } = colorMap[color];
  const effectiveTrend = trend ?? (growth > 0 ? 'up' : growth < 0 ? 'down' : 'neutral');
  const isPositive = effectiveTrend === 'up';

  if (loading) {
    return (
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
      >
        <CardHeader>
          <SkeletonPulse
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: 100, height: 16 }}
          />
          <SkeletonPulse style={{ width: 40, height: 40, borderRadius: 10 }} />
        </CardHeader>
        <SkeletonPulse
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.2 }}
          style={{ width: 140, height: 32 }}
        />
        <SkeletonPulse
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.4 }}
          style={{ width: 80, height: 24 }}
        />
      </Card>
    );
  }

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <IconWrapper $color={colorKey} $bg={bg}>
          <Icon />
        </IconWrapper>
      </CardHeader>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2 }}
      >
        <CardValue>{value}</CardValue>
      </motion.div>

      <CardFooter>
        {effectiveTrend === 'neutral' ? (
          <NeutralIndicator $positive>
            0.0%
          </NeutralIndicator>
        ) : (
          <ChangeIndicator $positive={isPositive}>
            {isPositive ? <RiArrowUpLine /> : <RiArrowDownLine />}
            {Math.abs(growth).toFixed(1)}%
          </ChangeIndicator>
        )}
        <ChangeLabel>vs. período anterior</ChangeLabel>
      </CardFooter>
    </Card>
  );
}
