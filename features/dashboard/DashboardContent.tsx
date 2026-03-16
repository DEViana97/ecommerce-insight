'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
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
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatCurrency';

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

const BottomRow = styled.div`
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
  const res = await fetch(`/api/products?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export default function DashboardContent() {
  const { period, channel, category } = useFiltersStore();

  const params = { period, channel, category };

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales', period, channel, category],
    queryFn: () => fetchSales(params),
  });

  const { data: conversionData, isLoading: conversionLoading } = useQuery({
    queryKey: ['conversion', period, channel, category],
    queryFn: () => fetchConversion(params),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', period, channel, category],
    queryFn: () => fetchProducts({ ...params, limit: '10' }),
  });

  const kpis = salesData?.kpis;

  return (
    <Grid>
      <KPIGrid>
        <KPICard
          title="Receita Total"
          value={kpis ? formatCurrency(kpis.totalRevenue, true) : '—'}
          change={kpis?.revenueChange ?? 0}
          icon={RiMoneyDollarCircleLine}
          color="primary"
          delay={0}
          loading={salesLoading}
        />
        <KPICard
          title="Pedidos"
          value={kpis ? formatNumber(kpis.totalOrders, true) : '—'}
          change={kpis?.ordersChange ?? 0}
          icon={RiShoppingCart2Line}
          color="success"
          delay={0.1}
          loading={salesLoading}
        />
        <KPICard
          title="Taxa de Conversão"
          value={kpis ? formatPercent(kpis.conversionRate) : '—'}
          change={kpis?.conversionChange ?? 0}
          icon={RiPercentLine}
          color="warning"
          delay={0.2}
          loading={salesLoading}
        />
        <KPICard
          title="Ticket Médio"
          value={kpis ? formatCurrency(kpis.avgTicket, true) : '—'}
          change={kpis?.avgTicketChange ?? 0}
          icon={RiPriceTag3Line}
          color="info"
          delay={0.3}
          loading={salesLoading}
        />
      </KPIGrid>

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
