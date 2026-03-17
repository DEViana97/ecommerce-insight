'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  createdAt: string;
}

interface ProductsResponse {
  products: Product[];
  total: number;
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
  grid-template-columns: 2fr 1fr 1fr;
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

async function fetchProducts(page: number, search: string): Promise<ProductsResponse> {
  const qs = new URLSearchParams({ page: String(page), limit: '10', search });
  const res = await fetch(`/api/products?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const debouncedSearch = useMemo(() => search.trim(), [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['products-module', page, debouncedSearch],
    queryFn: () => fetchProducts(page, debouncedSearch),
  });

  return (
    <Wrapper>
      <Header>
        <Title>Produtos</Title>
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nome ou categoria"
        />
      </Header>

      <Card>
        <Row>
          <strong>Nome</strong>
          <strong>Categoria</strong>
          <strong>Preco</strong>
        </Row>
        {isLoading ? (
          <Row>Carregando...</Row>
        ) : (
          data?.products.map((product) => (
            <Row key={product.id}>
              <span>{product.name}</span>
              <span>{product.category}</span>
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(product.price)}
              </span>
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
