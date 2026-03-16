'use client';

import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';
import { Theme } from '../../styles/theme';

interface DataPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  data: DataPoint[];
  period: string;
  loading?: boolean;
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
  padding: 5px 14px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 13px;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.fast};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.inverse : theme.colors.text.secondary)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};

  &:hover {
    background: ${({ $active, theme }) => ($active ? theme.colors.primaryHover : theme.colors.surfaceHover)};
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
`;

const TooltipDate = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 6px;
`;

const TooltipValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TooltipSub = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

function formatDateLabel(date: string, period: string): string {
  if (period === '12m') {
    const [year, month] = date.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, 1);
    return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  }
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, period, metric }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload as DataPoint;
  return (
    <CustomTooltipWrapper>
      <TooltipDate>{formatDateLabel(label as string, period)}</TooltipDate>
      <TooltipValue>
        {metric === 'revenue' ? formatCurrency(data.revenue) : formatNumber(data.orders)}
      </TooltipValue>
      <TooltipSub>
        {metric === 'revenue' ? `${data.orders} pedidos` : `${formatCurrency(data.revenue)} em receita`}
      </TooltipSub>
    </CustomTooltipWrapper>
  );
}

export default function SalesChart({ data, period, loading }: SalesChartProps) {
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');
  const theme = useTheme() as Theme;

  const formattedData = data.map((d) => ({
    ...d,
    label: formatDateLabel(d.date, period),
  }));

  const tickCount = period === '7d' ? 7 : period === '30d' ? 6 : 12;
  const step = Math.max(1, Math.floor(formattedData.length / tickCount));

  return (
    <ChartCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <ChartHeader>
        <ChartTitle>Evolução de Vendas</ChartTitle>
        <MetricTabs>
          <MetricTab $active={metric === 'revenue'} onClick={() => setMetric('revenue')}>Receita</MetricTab>
          <MetricTab $active={metric === 'orders'} onClick={() => setMetric('orders')}>Pedidos</MetricTab>
        </MetricTabs>
      </ChartHeader>

      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.colors.chart.primary} stopOpacity={0.2} />
                <stop offset="95%" stopColor={theme.colors.chart.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: theme.colors.text.muted }}
              axisLine={false}
              tickLine={false}
              interval={step - 1}
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
              content={(props) => <CustomTooltip {...props} period={period} metric={metric} />}
              cursor={{ stroke: theme.colors.border, strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={theme.colors.chart.primary}
              strokeWidth={2.5}
              fill="url(#colorRevenue)"
              dot={false}
              activeDot={{ r: 5, fill: theme.colors.chart.primary, stroke: theme.colors.surface, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartCard>
  );
}
