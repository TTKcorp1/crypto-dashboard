'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';
import { getApiUrl } from '@/src/lib/api';

interface Investment {
  _id: string;
  symbol: string;
  assetType: 'stock' | 'crypto';
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  gainLoss: number;
  gainLossPercent: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    totalValue: 0,
    totalInvested: 0,
    gainLoss: 0,
    gainLossPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/api/investments'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch investments');
        }

        const data = await response.json();
        setInvestments(data.investments || []);

        // Calculate portfolio stats
        const totalInvested = data.investments.reduce(
          (sum: number, inv: Investment) => sum + inv.purchasePrice * inv.quantity,
          0
        );

        const totalValue = totalInvested; // In real app, use current prices
        const gainLoss = totalValue - totalInvested;
        const gainLossPercent = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;

        setStats({
          totalValue,
          totalInvested,
          gainLoss,
          gainLossPercent,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [router]);

  const handleBuySignal = () => {
    alert('📈 Buy Signal Generated!');
  };

  const handleSellSignal = () => {
    alert('📉 Sell Signal Generated!');
  };

  if (loading) {
    return (
      <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Loading your portfolio...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1000px', margin: '60px auto', padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: '32px' }}>🎯 Your Portfolio</h1>

      {error && (
        <div style={{ color: '#d32f2f', marginBottom: '20px', padding: '12px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {/* Portfolio Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Total Portfolio Value</p>
          <h2 style={{ margin: 0, color: '#1976d2' }}>${stats.totalValue.toFixed(2)}</h2>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Total Invested</p>
          <h2 style={{ margin: 0, color: '#388e3c' }}>${stats.totalInvested.toFixed(2)}</h2>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Gain/Loss</p>
          <h2 style={{
            margin: 0,
            color: stats.gainLoss >= 0 ? '#388e3c' : '#d32f2f',
          }}>
            {stats.gainLoss >= 0 ? '+' : ''}{stats.gainLoss.toFixed(2)} ({stats.gainLossPercent.toFixed(2)}%)
          </h2>
        </div>
      </div>

      {/* Trading Signals */}
      <div style={{
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        borderLeft: '4px solid #ff9800',
      }}>
        <h3 style={{ marginTop: 0 }}>Trading Signals</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleBuySignal}
            style={{
              padding: '10px 20px',
              backgroundColor: '#388e3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            💰 Buy Signal
          </button>
          <button
            onClick={handleSellSignal}
            style={{
              padding: '10px 20px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            📊 Sell Signal
          </button>
        </div>
      </div>

      {/* Investments Table */}
      <div style={{
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ padding: '20px 20px 0 20px', margin: 0 }}>Your Investments</h3>
        
        {investments.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
            <p>No investments yet. Start building your portfolio!</p>
            <Link href="/" style={{
              color: '#1976d2',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}>
              ← Back to Home
            </Link>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '16px',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#e0e0e0', borderBottom: '2px solid #bdbdbd' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 'bold' }}>Symbol</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 'bold' }}>Type</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 'bold' }}>Quantity</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 'bold' }}>Purchase Price</th>
                <th style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 'bold' }}>Total Value</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 'bold' }}>Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((investment) => (
                <tr
                  key={investment._id}
                  style={{
                    borderBottom: '1px solid #e0e0e0',
                  }}
                >
                  <td style={{ padding: '12px 20px', fontWeight: 'bold' }}>{investment.symbol}</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: investment.assetType === 'crypto' ? '#e3f2fd' : '#f3e5f5',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}>
                      {investment.assetType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>{investment.quantity}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>${investment.purchasePrice.toFixed(2)}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 'bold' }}>
                    ${(investment.purchasePrice * investment.quantity).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    {new Date(investment.purchaseDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Navigation Links */}
      <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
        <Link href="/" style={{
          color: '#1976d2',
          textDecoration: 'none',
          marginRight: '20px',
          fontWeight: 'bold',
        }}>
          ← Back to Home
        </Link>
        <button 
          onClick={logout}
          style={{
            color: '#d32f2f',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            textDecoration: 'underline',
          }}
        >
          Logout
        </button>
      </div>
    </main>
  );
}
