'use client';

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
export {};

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

// 1. Protection and loading logic here
useEffect(() => {
   if (!isLoading && !user) {
    router.push('/Login');
  }
},  [user, isLoading, router]);

if (isLoading) {
  return <div>Loading dashboard...</div>;
}


  // 2. Main return here
  return (
    <main style={{ maxWidth: '700px', margin: '60px auto', padding: '24px' }}>
      <h1>Dashboard</h1>
      <p>Welcome{user ? `, ${user.name}` : ''}.</p>
      <button onClick={logout} style={{ padding: '10px 16px', marginTop: '12px' }}>
        Logout
      </button>
    </main>
  );
}