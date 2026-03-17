'use client';

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import {
  RiMoneyDollarCircleLine,
  RiShoppingCart2Line,
  RiPercentLine,
  RiPriceTag3Line,
} from 'react-icons/ri';
import { useFiltersStore } from '../../store/filtersStore';
import KPICard from '../../components/KPICard';
import SalesChart from '../../components/Charts/SalesChart';
import ConversionFunnel from '../../components/Charts/ConversionFunnel';
import TopProducts from '../../components/Charts/TopProducts';
import DataTable from '../../components/DataTable';
import InsightsPanel from '../../components/InsightsPanel';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatCurrency';
import { generateInsights } from '../../utils/generateInsights';

const Grid = styled.div`
  display: grid;
  gap: 20px;
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

interface SalesData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgTicket: number;
    conversionRate: number;
    revenueChange: number;
    ordersChange: number;
    avgTicketChange: number;
    conversionChange: number;
  };
  timeSeries: { date: string; revenue: number; orders: number }[];
  channelBreakdown: { channel: string; revenue: number; orders: number }[];
}

interface ConversionData {
  funnel: { stage: string; value: number; rate: number }[];
  categoryBreakdown: { category: string; revenue: number; orders: number }[];
}

interface ProductsData {
  products: {
    productId: string;
    productName: string;
    category: string;
    revenue: number;
    units: number;
    orders: number;
  }[];
}

interface InsightOrder {
  id: string;
  productId: string;
  productName: string;
  total: number;
  salesChannel: string;
  date: string;
}

interface OrdersInsightResponse {
  orders: InsightOrder[];
}

async function fetchSales(params: Record<string, string>): Promise<SalesData> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/analytics/sales?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch sales');
  return res.json();
}

async function fetchConversion(params: Record<string, string>): Promise<ConversionData> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/analytics/conversion?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch conversion');
  return res.json();
}

async function fetchProducts(params: Record<string, string>): Promise<ProductsData> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/products?mode=ranking&${qs}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

async function fetchInsightOrders(params: Record<string, string>): Promise<OrdersInsightResponse> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/orders?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch orders for insights');
  return res.json();
}

export default function DashboardContent() {
  const period = useFiltersStore((s) => s.period);
  const channel = useFiltersStore((s) => s.channel);
  const category = useFiltersStore((s) => s.category);

  const params = { period, channel, category };

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales', period, channel, category],
    queryFn: () => fetchSales(params),
  });

  const { data: conversionData, isLoading: conversionLoading } = useQuery({
    queryKey: ['conversion', period, channel, category],
    queryFn: () => fetchConversion(params),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products', period, channel, category],
    queryFn: () => fetchProducts({ ...params, limit: '10' }),
  });

  const { data: currentOrders, isLoading: currentOrdersLoading } = useQuery({
    queryKey: ['insights-orders-current', period, channel, category],
    queryFn: () => fetchInsightOrders({ ...params, limit: 'all' }),
  });

  const { data: previousOrders, isLoading: previousOrdersLoading } = useQuery({
    queryKey: ['insights-orders-previous', period, channel, category],
    queryFn: () => fetchInsightOrders({ ...params, limit: 'all', compare: 'previous' }),
  });

  const insights = useMemo(
    () =>
      generateInsights(
        {
          current: currentOrders?.orders ?? [],
          previous: previousOrders?.orders ?? [],
        },
        { period, channel, category }
      ),
    [currentOrders?.orders, previousOrders?.orders, period, channel, category]
  );

  const kpis = salesData?.kpis;

  return (
    <Grid>
      <KPIGrid>
        <KPICard
          title="Receita Total"
          value={kpis ? formatCurrency(kpis.totalRevenue, true) : '—'}
          growth={kpis?.revenueChange ?? 0}
          trend={!kpis ? 'neutral' : kpis.revenueChange >= 0 ? 'up' : 'down'}
          icon={RiMoneyDollarCircleLine}
          color="primary"
          delay={0}
          loading={salesLoading}
        />
        <KPICard
          title="Pedidos"
          value={kpis ? formatNumber(kpis.totalOrders, true) : '—'}
          growth={kpis?.ordersChange ?? 0}
          trend={!kpis ? 'neutral' : kpis.ordersChange >= 0 ? 'up' : 'down'}
          icon={RiShoppingCart2Line}
          color="success"
          delay={0.1}
          loading={salesLoading}
        />
        <KPICard
          title="Taxa de Conversão"
          value={kpis ? formatPercent(kpis.conversionRate) : '—'}
          growth={kpis?.conversionChange ?? 0}
          trend={!kpis ? 'neutral' : kpis.conversionChange >= 0 ? 'up' : 'down'}
          icon={RiPercentLine}
          color="warning"
          delay={0.2}
          loading={salesLoading}
        />
        <KPICard
          title="Ticket Médio"
          value={kpis ? formatCurrency(kpis.avgTicket, true) : '—'}
          growth={kpis?.avgTicketChange ?? 0}
          trend={!kpis ? 'neutral' : kpis.avgTicketChange >= 0 ? 'up' : 'down'}
          icon={RiPriceTag3Line}
          color="info"
          delay={0.3}
          loading={salesLoading}
        />
      </KPIGrid>

      <InsightsPanel
        insights={insights}
        loading={currentOrdersLoading || previousOrdersLoading}
      />

      <SalesChart
        data={salesData?.timeSeries ?? []}
        period={period}
        loading={salesLoading}
      />

      <ChartsRow>
        <ConversionFunnel
          data={conversionData?.funnel ?? []}
          loading={conversionLoading}
        />
        <TopProducts data={productsData?.products ?? []} />
      </ChartsRow>

      <DataTable />
    </Grid>
  );
}
