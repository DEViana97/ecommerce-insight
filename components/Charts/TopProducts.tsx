'use client';

import React, { useState } from 'react';
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
  TooltipProps,
} from 'recharts';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';
import { Theme } from '../../styles/theme';

interface ProductData {
  productName: string;
  revenue: number;
  units: number;
  orders: number;
}

interface TopProductsProps {
  data: ProductData[];
}

const ChartCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const ChartTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MetricTabs = styled.div`
  display: flex;
  gap: 2px;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 4px;
`;

const MetricTab = styled.button<{ $active: boolean }>`
  padding: 5px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 13px;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.fast};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.inverse : theme.colors.text.secondary)};
  background: ${({ $active, theme }) => ($active ? theme.colors.secondary : 'transparent')};

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.secondary : theme.colors.surfaceHover)};
  }
`;

const ChartWrapper = styled.div`
  height: 280px;
`;

const CustomTooltipWrapper = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px 14px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-width: 200px;
`;

const TooltipName = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 4px;
  word-break: break-word;
`;

const TooltipValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltipContent({ active, payload, metric }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as ProductData;
  return (
    <CustomTooltipWrapper>
      <TooltipName>{data.productName}</TooltipName>
      <TooltipValue>
        {metric === 'revenue' ? formatCurrency(data.revenue) : formatNumber(data.units)}
      </TooltipValue>
    </CustomTooltipWrapper>
  );
}

function truncateName(name: string, maxLen = 18): string {
  return name.length > maxLen ? name.slice(0, maxLen) + '…' : name;
}

export default function TopProducts({ data }: TopProductsProps) {
  const [metric, setMetric] = useState<'revenue' | 'units'>('revenue');
  const theme = useTheme() as Theme;

  const chartData = data.slice(0, 8).map((p) => ({
    ...p,
    shortName: truncateName(p.productName),
  }));

  return (
    <ChartCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <ChartHeader>
        <ChartTitle>Top Produtos</ChartTitle>
        <MetricTabs>
          <MetricTab $active={metric === 'revenue'} onClick={() => setMetric('revenue')}>Receita</MetricTab>
          <MetricTab $active={metric === 'units'} onClick={() => setMetric('units')}>Unidades</MetricTab>
        </MetricTabs>
      </ChartHeader>

      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
            <XAxis
              dataKey="shortName"
              tick={{ fontSize: 10, fill: theme.colors.text.muted }}
              axisLine={false}
              tickLine={false}
              angle={-35}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tick={{ fontSize: 11, fill: theme.colors.text.muted }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                metric === 'revenue'
                  ? `R$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`
                  : String(v)
              }
              width={55}
            />
            <Tooltip
              content={(props) => <CustomTooltipContent {...props} metric={metric} />}
              cursor={{ fill: `${theme.colors.secondary}15` }}
            />
            <Bar
              dataKey={metric}
              fill={theme.colors.chart.secondary}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartCard>
  );
}
