'use client';

import React, { useEffect, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from 'recharts';
import { formatNumber, formatPercent } from '../../utils/formatCurrency';
import { Theme } from '../../styles/theme';

interface FunnelStep {
  stage: string;
  value: number;
  rate: number;
}

interface ConversionFunnelProps {
  data: FunnelStep[];
  loading?: boolean;
}

const ChartCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
`;

const ChartHeader = styled.div`
  margin-bottom: 24px;
`;

const ChartTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const ChartSubtitle = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ChartWrapper = styled.div`
  height: 260px;
`;

const CustomTooltipWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px 14px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const TooltipLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 4px;
`;

const TooltipValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TooltipRate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 2px;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltipContent({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as FunnelStep;
  return (
    <CustomTooltipWrapper>
      <TooltipLabel>{data.stage}</TooltipLabel>
      <TooltipValue>{formatNumber(data.value)}</TooltipValue>
      <TooltipRate>Taxa: {formatPercent(data.rate)}</TooltipRate>
    </CustomTooltipWrapper>
  );
}

export default function ConversionFunnel({ data }: ConversionFunnelProps) {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme() as Theme;

  useEffect(() => {
    setMounted(true);
  }, []);

  const colors = [
    theme.colors.chart.primary,
    theme.colors.chart.secondary,
    theme.colors.chart.tertiary,
    theme.colors.chart.quaternary,
    theme.colors.chart.quinary,
  ];

  return (
    <ChartCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <ChartHeader>
        <ChartTitle>Funil de Conversão</ChartTitle>
        <ChartSubtitle>Da visita até a compra finalizada</ChartSubtitle>
      </ChartHeader>

      <ChartWrapper>
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: theme.colors.text.muted }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
              />
              <YAxis
                dataKey="stage"
                type="category"
                tick={{ fontSize: 11, fill: theme.colors.text.muted }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip content={<CustomTooltipContent />} cursor={{ fill: `${theme.colors.primary}10` }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </ChartWrapper>
    </ChartCard>
  );
}
