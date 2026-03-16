'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSearchLine,
} from 'react-icons/ri';
import { useQuery } from '@tanstack/react-query';
import { useFiltersStore } from '../../store/filtersStore';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

interface Order {
  id: string;
  productName: string;
  customer: string;
  total: number;
  salesChannel: string;
  date: string;
  category: string;
  quantity: number;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  totalPages: number;
  page: number;
}

const TableCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
  gap: 12px;
`;

const TableTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TableSubtitle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-left: 8px;
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 7px 12px;
  min-width: 200px;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 15px;
`;

const SearchInput = styled.input`
  background: none;
  border: none;
  outline: none;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const TableScroll = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th<{ $sortable?: boolean }>`
  padding: 12px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.text.muted};
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: ${({ $sortable }) => ($sortable ? 'pointer' : 'default')};
  white-space: nowrap;
  user-select: none;

  &:hover {
    color: ${({ $sortable, theme }) => ($sortable ? theme.colors.text.primary : theme.colors.text.muted)};
  }
`;

const ThContent = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SortIcon = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 12px;
`;

const Tr = styled(motion.tr)`
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: background ${({ theme }) => theme.transitions.fast};
  cursor: default;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
`;

const OrderId = styled.span`
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ProductName = styled.span`
  font-weight: 500;
  max-width: 200px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChannelBadge = styled.span<{ $channel: string }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  ${({ $channel, theme }) => {
    switch ($channel) {
      case 'organic':
        return `background: ${theme.colors.successLight}; color: ${theme.colors.success};`;
      case 'ads':
        return `background: ${theme.colors.infoLight}; color: ${theme.colors.info};`;
      case 'social':
        return `background: ${theme.colors.primaryLight}; color: ${theme.colors.primary};`;
      case 'email':
        return `background: ${theme.colors.warningLight}; color: ${theme.colors.warning};`;
      default:
        return `background: ${theme.colors.borderLight}; color: ${theme.colors.text.secondary};`;
    }
  }}
`;

const Revenue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
  gap: 12px;
`;

const PaginationInfo = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageBtn = styled.button<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  color: ${({ $active, theme }) => ($active ? theme.colors.text.inverse : theme.colors.text.secondary)};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ $active, theme }) => ($active ? theme.colors.primaryHover : theme.colors.surfaceHover)};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 14px;
`;

const CHANNEL_LABELS: Record<string, string> = {
  organic: 'Orgânico',
  ads: 'Anúncios',
  social: 'Social',
  email: 'E-mail',
};

async function fetchOrders(params: Record<string, string>): Promise<OrdersResponse> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/orders?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

type SortField = 'date' | 'total' | 'productName' | 'customer';
type SortDir = 'asc' | 'desc';

export default function DataTable() {
  const { period, channel, category, searchQuery } = useFiltersStore();
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [localSearch, setLocalSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', period, channel, category, page, sortBy, sortDir, localSearch || searchQuery],
    queryFn: () =>
      fetchOrders({
        period,
        channel,
        category,
        page: String(page),
        limit: '10',
        sortBy,
        sortDir,
        search: localSearch || searchQuery,
      }),
  });

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
    setPage(1);
  }

  function renderSortIndicator(field: SortField) {
    if (sortBy !== field) {
      return (
        <SortIcon>
          <RiArrowUpSLine style={{ opacity: 0.3 }} />
        </SortIcon>
      );
    }
    return sortDir === 'asc' ? <RiArrowUpSLine /> : <RiArrowDownSLine />;
  }

  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const startItem = (page - 1) * 10 + 1;
  const endItem = Math.min(page * 10, total);

  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <TableCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
    >
      <TableHeader>
        <div>
          <TableTitle>
            Pedidos Recentes
            {total > 0 && <TableSubtitle>({total} pedidos)</TableSubtitle>}
          </TableTitle>
        </div>
        <SearchWrapper>
          <SearchIcon><RiSearchLine /></SearchIcon>
          <SearchInput
            placeholder="Buscar pedido..."
            value={localSearch}
            onChange={(e) => { setLocalSearch(e.target.value); setPage(1); }}
          />
        </SearchWrapper>
      </TableHeader>

      <TableScroll>
        <Table>
          <thead>
            <tr>
              <Th>Pedido</Th>
              <Th $sortable onClick={() => handleSort('productName')}>
                <ThContent>Produto {renderSortIndicator('productName')}</ThContent>
              </Th>
              <Th $sortable onClick={() => handleSort('customer')}>
                <ThContent>Cliente {renderSortIndicator('customer')}</ThContent>
              </Th>
              <Th $sortable onClick={() => handleSort('total')}>
                <ThContent>Valor {renderSortIndicator('total')}</ThContent>
              </Th>
              <Th>Canal</Th>
              <Th $sortable onClick={() => handleSort('date')}>
                <ThContent>Data {renderSortIndicator('date')}</ThContent>
              </Th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <Tr key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <Td key={j}>
                        <div style={{ height: 16, background: 'var(--border)', borderRadius: 4, width: j === 1 ? 160 : 80 }} />
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState>Nenhum pedido encontrado para os filtros selecionados.</EmptyState>
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <Tr
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                  >
                    <Td><OrderId>{order.id}</OrderId></Td>
                    <Td><ProductName title={order.productName}>{order.productName}</ProductName></Td>
                    <Td>{order.customer}</Td>
                    <Td><Revenue>{formatCurrency(order.total)}</Revenue></Td>
                    <Td>
                      <ChannelBadge $channel={order.salesChannel}>
                        {CHANNEL_LABELS[order.salesChannel] ?? order.salesChannel}
                      </ChannelBadge>
                    </Td>
                    <Td>{formatDate(order.date)}</Td>
                  </Tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </Table>
      </TableScroll>

      <Pagination>
        <PaginationInfo>
          {total > 0 ? `Mostrando ${startItem}–${endItem} de ${total}` : 'Nenhum resultado'}
        </PaginationInfo>
        <PaginationControls>
          <PageBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <RiArrowLeftSLine />
          </PageBtn>
          {pageNumbers.map((n) => (
            <PageBtn key={n} $active={n === page} onClick={() => setPage(n)}>
              {n}
            </PageBtn>
          ))}
          <PageBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <RiArrowRightSLine />
          </PageBtn>
        </PaginationControls>
      </Pagination>
    </TableCard>
  );
}
