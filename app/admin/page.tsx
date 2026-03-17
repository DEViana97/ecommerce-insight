'use client';

import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import DashboardLayout from '../../components/DashboardLayout';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

const Wrapper = styled.section`
  display: grid;
  gap: 16px;
`;

const Table = styled.div`
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
`;

async function fetchUsers(): Promise<{ users: AdminUser[] }> {
  const res = await fetch('/api/admin/users');
  if (!res.ok) throw new Error('Failed to load users');
  return res.json();
}

async function updateRole(userId: string, role: 'ADMIN' | 'USER') {
  await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role }),
  });
}

export default function AdminPage() {
  const { data, refetch } = useQuery({ queryKey: ['admin-users'], queryFn: fetchUsers });

  return (
    <DashboardLayout>
      <Wrapper>
        <h1>Admin</h1>
        <Table>
          <Row>
            <strong>Nome</strong>
            <strong>Email</strong>
            <strong>Role</strong>
          </Row>
          {data?.users.map((user) => (
            <Row key={user.id}>
              <span>{user.name}</span>
              <span>{user.email}</span>
              <select
                value={user.role}
                onChange={async (event) => {
                  await updateRole(user.id, event.target.value as 'ADMIN' | 'USER');
                  await refetch();
                }}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </Row>
          ))}
        </Table>
      </Wrapper>
    </DashboardLayout>
  );
}
