// This file should not exist in the backend
export {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
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
        alert('Registration successful! Go to login.');
        router.push('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '50px auto' }}>
      <h1>Register</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          style={{ display: 'block', margin: '10px 0', padding: '10px', width: '100%' }}
          required
        />
        <button type="submit" disabled={loading} style={{ padding: '12px 20px', marginTop: '10px' }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}