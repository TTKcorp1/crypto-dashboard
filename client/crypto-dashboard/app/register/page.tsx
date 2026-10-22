'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: '420px', margin: '60px auto', padding: '24px' }}>
      <h1>Register</h1>
      {error ? <p style={{ color: 'red' }}>{error}</p> : null}
      <form onSubmit={handleSubmit}>
        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Name" required style={{ display: 'block', width: '100%', marginBottom: '12px', padding: '10px' }} />
        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" required style={{ display: 'block', width: '100%', marginBottom: '12px', padding: '10px' }} />
        <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Password" required style={{ display: 'block', width: '100%', marginBottom: '12px', padding: '10px' }} />
        <button type="submit" disabled={loading} style={{ padding: '10px 16px' }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </main>
  );
}
