'use client';

import React from 'react';
import styled from 'styled-components';
import { RiFilterLine } from 'react-icons/ri';
import { useFiltersStore, SalesChannel, Category } from '../../store/filtersStore';

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 500;
`;

const Select = styled.select`
  padding: 7px 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  outline: none;
  cursor: pointer;
  transition: border-color ${({ theme }) => theme.transitions.fast};
  font-family: inherit;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CHANNELS: { label: string; value: SalesChannel }[] = [
  { label: 'Todos os canais', value: 'all' },
  { label: 'Orgânico', value: 'organic' },
  { label: 'Anúncios', value: 'ads' },
  { label: 'Social', value: 'social' },
  { label: 'E-mail', value: 'email' },
];

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'Todas as categorias', value: 'all' },
  { label: 'Eletrônicos', value: 'Electronics' },
  { label: 'Roupas', value: 'Clothing' },
  { label: 'Casa', value: 'Home' },
  { label: 'Esportes', value: 'Sports' },
  { label: 'Livros', value: 'Books' },
  { label: 'Beleza', value: 'Beauty' },
];

export default function FiltersBar() {
  const { channel, setChannel, category, setCategory } = useFiltersStore();

  return (
    <Bar>
      <FilterLabel>
        <RiFilterLine />
        Filtros:
      </FilterLabel>
      <Select value={channel} onChange={(e) => setChannel(e.target.value as SalesChannel)}>
        {CHANNELS.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </Select>
      <Select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </Select>
    </Bar>
  );
}
