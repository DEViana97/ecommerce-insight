'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';

interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orders: { id: string; total: number; date: string }[];
}

interface CustomersResponse {
  customers: Customer[];
  totalPages: number;
}

const Wrapper = styled.section`
  display: grid;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 22px;
  font-weight: 800;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px 12px;
  min-width: 280px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.text.secondary};

  &:last-child {
    border-bottom: 0;
  }
`;

const Pager = styled.div`
  display: flex;
  gap: 8px;
`;

const Btn = styled.button`
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 8px 12px;
`;

async function fetchCustomers(page: number, search: string): Promise<CustomersResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: '10', search });
  const res = await fetch(`/api/customers?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json();
}

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const debouncedSearch = useMemo(() => search.trim(), [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['customers-module', page, debouncedSearch],
    queryFn: () => fetchCustomers(page, debouncedSearch),
  });

  return (
    <Wrapper>
      <Header>
        <Title>Clientes</Title>
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nome ou email"
        />
      </Header>

      <Card>
        <Row>
          <strong>Nome</strong>
          <strong>Email</strong>
          <strong>Ultimos pedidos</strong>
        </Row>
        {isLoading ? (
          <Row>Carregando...</Row>
        ) : (
          data?.customers.map((customer) => (
            <Row key={customer.id}>
              <span>{customer.name}</span>
              <span>{customer.email}</span>
              <span>{customer.orders.length}</span>
            </Row>
          ))
        )}
      </Card>

      <Pager>
        <Btn onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</Btn>
        <Btn disabled>{page}</Btn>
        <Btn onClick={() => setPage((value) => (data?.totalPages && value < data.totalPages ? value + 1 : value))}>
          Proxima
        </Btn>
      </Pager>
    </Wrapper>
  );
}
