'use client';

import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import DashboardLayout from '../../components/DashboardLayout';

const Wrapper = styled.section`
  display: grid;
  gap: 16px;
`;

const Card = styled.form`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 20px;
  display: grid;
  gap: 10px;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 10px 12px;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 10px 12px;
`;

async function fetchProfile() {
  const res = await fetch('/api/profile');
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

export default function ProfilePage() {
  const { data, refetch } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });

  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || undefined, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
    });
    await refetch();
    setCurrentPassword('');
    setNewPassword('');
  }

  const user = data?.user;

  return (
    <DashboardLayout>
      <Wrapper>
        <h1>Perfil</h1>
        <Card onSubmit={handleSubmit}>
          <Input defaultValue={user?.name} onChange={(event) => setName(event.target.value)} placeholder="Nome" />
          <Input defaultValue={user?.email} disabled placeholder="Email" />
          <Input
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            type="password"
            placeholder="Senha atual"
          />
          <Input
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            type="password"
            placeholder="Nova senha"
          />
          <Button type="submit">Salvar</Button>
        </Card>
      </Wrapper>
    </DashboardLayout>
  );
}
