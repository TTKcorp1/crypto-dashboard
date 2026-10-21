// This file should not exist in the backend
export {};   // Adjust path if needed

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, {
          id: '1', // temporary
          name: 'User',
          email: formData.email
        });
        router.push('/dashboard'); // we'll create this later
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h1>Login</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }}
          required
        />
        <button type="submit" disabled={loading} style={{ padding: '12px 30px', marginTop: '10px' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        No account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}