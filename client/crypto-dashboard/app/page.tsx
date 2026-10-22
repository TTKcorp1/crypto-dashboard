'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/context/AuthContext';

type Coin = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
  volume: number;
  color: string;
  mark: string;
  sparkline: number[];
};

type MarketCoin = {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price?: number[] };
};

const sampleCoins: Coin[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67432.18,
    change: 2.84,
    marketCap: 1328400000000,
    volume: 28400000000,
    color: '#f7931a',
    mark: '₿',
    sparkline: [42, 45, 43, 49, 47, 55, 52, 57, 54, 63, 60, 68, 65, 70, 67, 76, 73, 80, 77, 88, 84, 93, 90, 100],
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3521.76,
    change: 1.62,
    marketCap: 423600000000,
    volume: 12500000000,
    color: '#7886f7',
    mark: '◆',
    sparkline: [58, 54, 61, 57, 63, 59, 68, 66, 62, 72, 69, 76, 71, 78, 75, 73, 82, 78, 85, 80, 89, 86, 94, 100],
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 182.45,
    change: 5.31,
    marketCap: 82700000000,
    volume: 3200000000,
    color: '#9a72f5',
    mark: '◎',
    sparkline: [38, 42, 40, 48, 44, 53, 50, 58, 55, 61, 58, 67, 63, 71, 68, 75, 73, 82, 78, 86, 83, 92, 90, 100],
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    price: 598.31,
    change: -0.74,
    marketCap: 88300000000,
    volume: 1400000000,
    color: '#e9b949',
    mark: '◆',
    sparkline: [76, 80, 74, 78, 71, 75, 70, 73, 67, 71, 65, 69, 63, 67, 61, 66, 60, 64, 58, 62, 57, 61, 55, 58],
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    price: 0.6248,
    change: 0.91,
    marketCap: 34500000000,
    volume: 980000000,
    color: '#8d9aaa',
    mark: '✕',
    sparkline: [57, 55, 60, 58, 62, 57, 64, 61, 67, 63, 70, 66, 72, 68, 73, 70, 76, 72, 79, 74, 81, 78, 85, 83],
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.1682,
    change: -2.18,
    marketCap: 24200000000,
    volume: 720000000,
    color: '#c7a84b',
    mark: 'Ð',
    sparkline: [82, 77, 80, 73, 76, 70, 74, 68, 73, 66, 71, 64, 69, 63, 67, 61, 66, 58, 63, 56, 61, 54, 59, 52],
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USDC',
    price: 1,
    change: 0.02,
    marketCap: 32700000000,
    volume: 4100000000,
    color: '#4b8df8',
    mark: '$',
    sparkline: [50, 51, 50, 50, 49, 50, 50, 51, 50, 50, 51, 50, 49, 50, 50, 51, 50, 50, 49, 50, 51, 50, 50, 50],
  },
  {
    id: 'avalanche-2',
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 36.84,
    change: 3.07,
    marketCap: 14500000000,
    volume: 430000000,
    color: '#e65b68',
    mark: '▲',
    sparkline: [40, 44, 42, 48, 45, 52, 48, 56, 53, 59, 56, 64, 61, 69, 65, 73, 70, 77, 74, 83, 79, 88, 85, 100],
  },
];

const coinById = new Map(sampleCoins.map((coin) => [coin.id, coin]));
const timeframeOptions = ['24H', '7D'] as const;
type Timeframe = (typeof timeframeOptions)[number];

async function fetchMarketCoins(signal?: AbortSignal): Promise<Coin[]> {
  const ids = sampleCoins.map((coin) => coin.id).join(',');
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`,
    { cache: 'no-store', signal },
  );
  if (!response.ok) {
    throw new Error(`Market data service returned ${response.status}.`);
  }
  const marketData: MarketCoin[] = await response.json();
  if (!Array.isArray(marketData) || marketData.length === 0) {
    throw new Error('The market data service returned no prices.');
  }

  const liveCoins = marketData.flatMap((marketCoin) => {
    const baseCoin = coinById.get(marketCoin.id);
    if (!baseCoin || typeof marketCoin.current_price !== 'number') return [];
    return [{
      ...baseCoin,
      price: marketCoin.current_price,
      change: marketCoin.price_change_percentage_24h ?? 0,
      marketCap: marketCoin.market_cap ?? baseCoin.marketCap,
      volume: marketCoin.total_volume ?? baseCoin.volume,
      sparkline: marketCoin.sparkline_in_7d?.price?.length
        ? marketCoin.sparkline_in_7d.price
        : baseCoin.sparkline,
    }];
  });
  if (liveCoins.length === 0) {
    throw new Error('The market data service returned no supported assets.');
  }
  if (liveCoins.length !== sampleCoins.length) {
    throw new Error(`Market data service returned ${liveCoins.length} of ${sampleCoins.length} tracked assets.`);
  }
  return liveCoins;
}

function getMarketErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to load live market prices.';
}

function formatCurrency(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? 2 : 0,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  const units = [
    { limit: 1_000_000_000_000, suffix: 'T' },
    { limit: 1_000_000_000, suffix: 'B' },
    { limit: 1_000_000, suffix: 'M' },
    { limit: 1_000, suffix: 'K' },
  ];
  const unit = units.find((candidate) => value >= candidate.limit);
  if (!unit) return formatCurrency(value, 0);
  return `$${Number((value / unit.limit).toFixed(2)).toString()}${unit.suffix}`;
}

function formatPercent(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function sparklinePath(values: number[], width: number, height: number) {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / spread) * height;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function CoinMark({ coin, small = false }: { coin: Coin; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`coin-mark${small ? ' coin-mark-small' : ''}`}
      style={{ '--coin-color': coin.color } as React.CSSProperties}
    >
      {coin.mark}
    </span>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [coins, setCoins] = useState(sampleCoins);
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCoinId, setSelectedCoinId] = useState('bitcoin');
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [query, setQuery] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>(['bitcoin', 'ethereum', 'solana']);
  const [watchlistOnly, setWatchlistOnly] = useState(false);

  const refreshMarket = useCallback(async () => {
    setIsRefreshing(true);
    setMarketError(null);
    try {
      const liveCoins = await fetchMarketCoins();
      setCoins(liveCoins);
      setUsingLiveData(true);
      setLastUpdated(new Date());
    } catch (error) {
      setMarketError(getMarketErrorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    fetchMarketCoins(controller.signal).then((liveCoins) => {
      if (!isActive) return;
      setCoins(liveCoins);
      setUsingLiveData(true);
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }).catch((error: unknown) => {
      if (!isActive) return;
      setMarketError(getMarketErrorMessage(error));
      setIsRefreshing(false);
    });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  const selectedCoin = coins.find((coin) => coin.id === selectedCoinId) ?? coins[0];
  const filteredCoins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return coins.filter((coin) => {
      const matchesQuery = !normalizedQuery
        || coin.name.toLowerCase().includes(normalizedQuery)
        || coin.symbol.toLowerCase().includes(normalizedQuery);
      return matchesQuery && (!watchlistOnly || watchlist.includes(coin.id));
    });
  }, [coins, query, watchlist, watchlistOnly]);

  const trackedMarketCap = coins.reduce((sum, coin) => sum + coin.marketCap, 0);
  const trackedVolume = coins.reduce((sum, coin) => sum + coin.volume, 0);
  const averageChange = coins.reduce((sum, coin) => sum + coin.change, 0) / coins.length;
  const chartValues = timeframe === '24H'
    ? selectedCoin.sparkline.slice(-24)
    : selectedCoin.sparkline;
  const chartPath = sparklinePath(chartValues, 800, 200);
  const chartAreaPath = chartPath
    ? `${chartPath} L800,208 L0,208 Z`
    : '';
  const isCoinPositive = chartValues.length > 1
    ? chartValues[chartValues.length - 1] >= chartValues[0]
    : selectedCoin.change >= 0;
  const welcomeName = user?.name?.split(' ')[0] ?? (isAuthenticated ? 'there' : 'investor');

  function toggleWatchlist(id: string) {
    setWatchlist((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  }

  function exportMarketData() {
    const rows = [
      ['Name', 'Symbol', 'Price USD', '24h change %', 'Market cap USD', 'Volume USD'],
      ...coins.map((coin) => [
        coin.name,
        coin.symbol,
        coin.price.toString(),
        coin.change.toString(),
        coin.marketCap.toString(),
        coin.volume.toString(),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'crypto-market.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Coinly home">
          <span className="brand-icon"><span /></span>
          <span className="brand-name">coinly<span>.</span></span>
        </Link>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className={`nav-item${watchlistOnly ? '' : ' nav-item-active'}`} href="#overview">
            <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="2.5" width="6" height="6" rx="1.5" /><rect x="11.5" y="2.5" width="6" height="6" rx="1.5" /><rect x="2.5" y="11.5" width="6" height="6" rx="1.5" /><rect x="11.5" y="11.5" width="6" height="6" rx="1.5" /></svg>
            Overview
          </a>
          <a className="nav-item" href="#markets" onClick={() => setWatchlistOnly(false)}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 15.5 7.2 10l3 2.7 6.8-8.2" /><path d="M12.8 4.5H17v4.2" /></svg>
            Markets
          </a>
          <button
            className={`nav-item${watchlistOnly ? ' nav-item-active' : ''}`}
            onClick={() => {
              setWatchlistOnly((current) => !current);
              document.getElementById('markets')?.scrollIntoView({ behavior: 'smooth' });
            }}
            type="button"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2.5 2.3 4.8 5.2.8-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.7 5.2-.8L10 2.5Z" /></svg>
            Watchlist
            <span className="nav-count">{watchlist.length}</span>
          </button>
        </nav>

        <div className="sidebar-label sidebar-label-spaced">YOUR ACCOUNT</div>
        <nav className="sidebar-nav" aria-label="Account navigation">
          <Link className="nav-item" href={isAuthenticated ? '/dashboard' : '/login'}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="2" /><path d="M6.5 12h2m2.5-3h2.5m-2.5 3H14" /></svg>
            Portfolio
          </Link>
          <Link className="nav-item" href={isAuthenticated ? '/dashboard' : '/register'}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="7" r="3" /><path d="M4 17c.6-2.7 2.7-4 6-4s5.4 1.3 6 4" /></svg>
            {isAuthenticated ? 'My account' : 'Create account'}
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-spark">✳</div>
            <div className="tip-title">Stay in the know</div>
            <p>Create a free account to keep track of your portfolio.</p>
            <Link href="/register">Get started <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="sidebar-footer">
            <span className="status-dot" />
            Market data by CoinGecko
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <div className="topbar-actions">
            <div className="market-status">            <span className="status-dot" /> Crypto markets · 24/7</div>
            {isAuthenticated ? (
              <Link className="profile-button" href="/dashboard" aria-label="Open your portfolio">
                <span className="profile-avatar">{welcomeName.slice(0, 1).toUpperCase()}</span>
                <span className="profile-name">{welcomeName}</span>
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
              </Link>
            ) : (
              <Link className="sign-in-link" href="/login">Sign in <span aria-hidden="true">↗</span></Link>
            )}
          </div>
        </header>

        <main className="dashboard-content" id="overview">
          <section className="page-heading">
            <div>
              <div className="eyebrow"><span className="heading-spark">✳</span> YOUR MARKET SNAPSHOT</div>
              <h1>Good to see you, {welcomeName}<span className="heading-period">.</span></h1>
              <p>Here&apos;s what&apos;s happening across the crypto market today.</p>
            </div>
            <button className="export-button" onClick={exportMarketData} type="button">
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5v9m0 0 3.2-3.2M10 11.5 6.8 8.3M3.5 13v3.5h13V13" /></svg>
              Export data
            </button>
          </section>

          {marketError && (
            <div className="market-notice" role="status">
              <span className="notice-icon">!</span>
              <span>
                Couldn&apos;t refresh live prices: {marketError}{' '}
                {usingLiveData ? 'Showing the last successfully loaded prices.' : 'Showing sample prices instead.'}
              </span>
              <button onClick={() => void refreshMarket()} type="button">Try again</button>
            </div>
          )}

          <section className="stats-grid" aria-label="Market summary">
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-label">Tracked market cap</span>
                <span className="stat-icon stat-icon-purple">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5v15M14 6.2c0-1.4-1.6-2.2-4-2.2S6 5 6 6.4 7.4 8.5 10 9s4 1.2 4 2.6-1.6 2.4-4 2.4-4-.9-4-2.4" /></svg>
                </span>
              </div>
              <div className="stat-value">{formatCompactCurrency(trackedMarketCap)}</div>
              <div className="stat-caption"><span className="caption-dot purple-dot" /> Across {coins.length} tracked assets</div>
            </article>
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-label">24h trading volume</span>
                <span className="stat-icon stat-icon-blue">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 14.5 7.2 9l3 2.7L17 4" /><path d="M12.8 4H17v4.2" /></svg>
                </span>
              </div>
              <div className="stat-value">{formatCompactCurrency(trackedVolume)}</div>
              <div className="stat-caption"><span className="caption-dot blue-dot" /> Updated market activity</div>
            </article>
            <article className="stat-card">
              <div className="stat-topline">
                <span className="stat-label">Average 24h change</span>
                <span className={`stat-icon${averageChange >= 0 ? ' stat-icon-green' : ' stat-icon-red'}`}>
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 15.5v-11m0 0L5.8 8.7M10 4.5l4.2 4.2" /></svg>
                </span>
              </div>
              <div className={`stat-value ${averageChange >= 0 ? 'positive-text' : 'negative-text'}`}>{formatPercent(averageChange)}</div>
              <div className="stat-caption"><span className={`caption-dot ${averageChange >= 0 ? 'green-dot' : 'red-dot'}`} /> Tracked asset average</div>
            </article>
          </section>

          <section className="analysis-grid">
            <article className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="section-kicker">PRICE PERFORMANCE</div>
                  <div className="chart-coin-heading">
                    <CoinMark coin={selectedCoin} />
                    <div>
                      <h2>{selectedCoin.name} <span>{selectedCoin.symbol}</span></h2>
                      <div className="chart-price-row">
                        <span className="chart-price">{formatCurrency(selectedCoin.price, selectedCoin.price < 1 ? 4 : 2)}</span>
                        <span className={`change-pill${selectedCoin.change >= 0 ? ' change-positive' : ' change-negative'}`}>
                          {selectedCoin.change >= 0 ? '↗' : '↘'} {formatPercent(selectedCoin.change)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="timeframe-control" aria-label="Chart timeframe">
                  {timeframeOptions.map((option) => (
                    <button
                      aria-pressed={timeframe === option}
                      className={timeframe === option ? 'timeframe-active' : ''}
                      key={option}
                      onClick={() => setTimeframe(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chart-plot">
                <div className="chart-y-labels" aria-hidden="true">
                  <span>{formatCurrency(selectedCoin.price * 1.04, selectedCoin.price < 1 ? 4 : 0)}</span>
                  <span>{formatCurrency(selectedCoin.price * 1.02, selectedCoin.price < 1 ? 4 : 0)}</span>
                  <span>{formatCurrency(selectedCoin.price, selectedCoin.price < 1 ? 4 : 0)}</span>
                  <span>{formatCurrency(selectedCoin.price * 0.98, selectedCoin.price < 1 ? 4 : 0)}</span>
                </div>
                <svg className="price-chart" viewBox="0 0 800 220" preserveAspectRatio="none" role="img" aria-label={`${selectedCoin.name} ${timeframe} illustrative price chart`}>
                  <defs>
                    <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#a4e65e" stopOpacity=".24" />
                      <stop offset="100%" stopColor="#a4e65e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[8, 72, 136, 200].map((y) => (
                    <line className="chart-grid-line" key={y} x1="0" x2="800" y1={y} y2={y} />
                  ))}
                  {chartAreaPath && <path d={chartAreaPath} fill="url(#chart-fill)" />}
                  {chartPath && <path className={`chart-line${isCoinPositive ? '' : ' chart-line-negative'}`} d={chartPath} />}
                </svg>
              </div>
              <div className="chart-x-labels" aria-hidden="true">
                <span>{timeframe === '24H' ? '12:00 AM' : '7 days ago'}</span>
                <span>{timeframe === '24H' ? '6:00 AM' : '5 days ago'}</span>
                <span>{timeframe === '24H' ? '12:00 PM' : '3 days ago'}</span>
                <span>{timeframe === '24H' ? '6:00 PM' : 'Yesterday'}</span>
                <span>Now</span>
              </div>
              <div className="chart-footnote">
                <span className={`data-source-dot${usingLiveData ? ' live-source' : ''}`} />
                {usingLiveData ? 'Live market data' : 'Sample market data'}
                <span className="footnote-divider">·</span>
                {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Illustrative chart'}
              </div>
            </article>

            <aside className="insight-column">
              <article className="insight-card">
                <div className="insight-top">
                  <div>
                    <div className="section-kicker">TODAY&apos;S HIGHLIGHT</div>
                    <h2>Top performer</h2>
                  </div>
                  <span className="highlight-icon">✳</span>
                </div>
                {(() => {
                  const topPerformer = coins.reduce((best, coin) => coin.change > best.change ? coin : best, coins[0]);
                  return (
                    <button className="top-performer" onClick={() => setSelectedCoinId(topPerformer.id)} type="button">
                      <CoinMark coin={topPerformer} />
                      <span className="performer-info">
                        <strong>{topPerformer.name}</strong>
                        <span>{topPerformer.symbol}</span>
                      </span>
                      <span className="performer-gain">{formatPercent(topPerformer.change)}</span>
                    </button>
                  );
                })()}
                <div className="insight-divider" />
                <div className="mini-stat-row">
                  <span>BTC share of tracked cap</span>
                  <strong>{((coins.find((coin) => coin.id === 'bitcoin')?.marketCap ?? 0) / trackedMarketCap * 100).toFixed(1)}%</strong>
                </div>
                <div className="mini-stat-row">
                  <span>Assets tracked</span>
                  <strong>{coins.length} <span className="muted-strong">coins</span></strong>
                </div>
              </article>
              <article className="watchlist-card">
                <div className="watchlist-header">
                  <div>
                    <div className="section-kicker">YOUR PICKS</div>
                    <h2>Watchlist</h2>
                  </div>
                  <button
                    aria-label="Show watchlist in markets"
                    className="arrow-button"
                    onClick={() => {
                      setWatchlistOnly(true);
                      document.getElementById('markets')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    type="button"
                  >
                    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" /></svg>
                  </button>
                </div>
                <div className="watchlist-coins">
                  {coins.filter((coin) => watchlist.includes(coin.id)).slice(0, 3).map((coin) => (
                    <button className="watchlist-row" key={coin.id} onClick={() => setSelectedCoinId(coin.id)} type="button">
                      <CoinMark coin={coin} small />
                      <span className="watchlist-name">{coin.symbol}</span>
                      <span className="watchlist-price">{formatCurrency(coin.price, coin.price < 1 ? 4 : 0)}</span>
                      <span className={coin.change >= 0 ? 'watchlist-change positive-text' : 'watchlist-change negative-text'}>
                        {formatPercent(coin.change)}
                      </span>
                    </button>
                  ))}
                  {watchlist.length === 0 && <p className="empty-watchlist">Save a coin with the star in the market list.</p>}
                </div>
              </article>
            </aside>
          </section>

          <section className="markets-section" id="markets">
            <div className="markets-heading">
              <div>
                <div className="section-kicker">EXPLORE THE MARKET</div>
                <h2>Top cryptocurrencies <span className="asset-count">{filteredCoins.length}</span></h2>
              </div>
              <div className="market-tools">
                <label className="search-field">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.8" cy="8.8" r="5.8" /><path d="m13.2 13.2 4.3 4.3" /></svg>
                  <input
                    aria-label="Search cryptocurrencies"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search coins"
                    value={query}
                  />
                  {query && <button aria-label="Clear search" onClick={() => setQuery('')} type="button">×</button>}
                </label>
                <button
                  className={`filter-button${watchlistOnly ? ' filter-active' : ''}`}
                  onClick={() => setWatchlistOnly((current) => !current)}
                  type="button"
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2.5 2.3 4.8 5.2.8-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.7 5.2-.8L10 2.5Z" /></svg>
                  Watchlist
                </button>
                <button
                  aria-label="Refresh market prices"
                  className={`refresh-button${isRefreshing ? ' refresh-spinning' : ''}`}
                  disabled={isRefreshing}
                  onClick={() => void refreshMarket()}
                  type="button"
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 9a6 6 0 0 0-10.7-3L4 7.5" /><path d="M4 4.5v3h3m-3 3a6 6 0 0 0 10.7 3l1.3-1.5" /><path d="M16 15.5v-3h-3" /></svg>
                </button>
              </div>
            </div>

            <div className="market-table-wrap">
              <table className="market-table">
                <thead>
                  <tr>
                    <th className="th-asset">ASSET</th>
                    <th>PRICE</th>
                    <th>24H CHANGE</th>
                    <th>MARKET CAP</th>
                    <th>VOLUME (24H)</th>
                    <th className="th-trend">LAST 24H</th>
                    <th><span className="sr-only">Watchlist</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoins.map((coin, index) => (
                    <tr className={selectedCoin.id === coin.id ? 'selected-market-row' : ''} key={coin.id}>
                      <td className="asset-cell">
                        <span className="asset-rank">{String(index + 1).padStart(2, '0')}</span>
                        <CoinMark coin={coin} small />
                        <button className="asset-name-button" onClick={() => setSelectedCoinId(coin.id)} type="button">
                          <strong>{coin.name}</strong>
                          <span>{coin.symbol}</span>
                        </button>
                      </td>
                      <td className="price-cell">{formatCurrency(coin.price, coin.price < 1 ? 4 : 2)}</td>
                      <td>
                        <span className={`table-change${coin.change >= 0 ? ' positive-change' : ' negative-change'}`}>
                          {coin.change >= 0 ? '↗' : '↘'} {formatPercent(coin.change)}
                        </span>
                      </td>
                      <td className="table-number">{formatCompactCurrency(coin.marketCap)}</td>
                      <td className="table-number">{formatCompactCurrency(coin.volume)}</td>
                      <td>
                        <svg className={`mini-sparkline${coin.change < 0 ? ' mini-sparkline-down' : ''}`} viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
                          <path d={sparklinePath(coin.sparkline.slice(-24), 100, 28)} />
                        </svg>
                      </td>
                      <td>
                        <button
                          aria-label={`${watchlist.includes(coin.id) ? 'Remove' : 'Add'} ${coin.name} ${watchlist.includes(coin.id) ? 'from' : 'to'} watchlist`}
                          aria-pressed={watchlist.includes(coin.id)}
                          className={`star-button${watchlist.includes(coin.id) ? ' star-selected' : ''}`}
                          onClick={() => toggleWatchlist(coin.id)}
                          type="button"
                        >
                          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2.5 2.3 4.8 5.2.8-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.7 5.2-.8L10 2.5Z" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCoins.length === 0 && (
                <div className="empty-results">
                  <span>⌕</span>
                  <strong>No coins found</strong>
                  <p>Try a different search or add assets to your watchlist.</p>
                </div>
              )}
            </div>
            <div className="table-footer">
              <span><span className={`data-source-dot${usingLiveData ? ' live-source' : ''}`} /> {usingLiveData ? 'Live prices' : 'Sample prices'} · USD</span>
              <span>Showing {filteredCoins.length} of {coins.length} assets</span>
            </div>
          </section>

          <footer className="page-footer">
            <span>Coinly <span className="footer-dot">·</span> A clearer view of crypto.</span>
            <span>Prices are for informational purposes only.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
