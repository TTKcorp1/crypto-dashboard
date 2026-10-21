// This file should not exist in the backend
export {};
  return (
    <main style={{ maxWidth: '600px', margin: '80px auto', padding: '24px', textAlign: 'center' }}>
      <h1>Crypto Dashboard</h1>
      <p>Welcome to the app. Choose an option below to continue.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
        <Link href="/register" style={{ padding: '10px 16px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '6px' }}>
          Register
        </Link>
        <Link href="/login" style={{ padding: '10px 16px', background: '#111827', color: 'white', textDecoration: 'none', borderRadius: '6px' }}>
          Login
        </Link>
      </div>
    </main>
  );
}
