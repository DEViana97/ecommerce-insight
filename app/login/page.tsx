'use client';

import { FormEvent, useState } from 'react';
import styled from 'styled-components';
import { useAuthStore } from '../../store/authStore';
const Wrapper = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.colors.background};
  padding: 16px;
`;

const Card = styled.form`
  width: min(420px, 100%);
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 24px;
  display: grid;
  gap: 12px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 24px;
  font-weight: 800;
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
  font-weight: 700;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px;
`;

export default function LoginPage() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [email, setEmail] = useState('admin@ecommerce-insight.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      setError('Credenciais invalidas');
      setLoading(false);
      return;
    }

    await fetchMe();
    window.location.href = '/dashboard';
  }

  return (
    <Wrapper>
      <Card onSubmit={handleSubmit}>
        <Title>Login</Title>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          type="password"
          required
        />
        {error && <Message>{error}</Message>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </Card>
    </Wrapper>
  );
}
