import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Activity, BarChart2, DollarSign, Settings as SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Settings from './pages/Settings';

// Real Data Component
const CommandCenter = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: performance, error } = await supabase
        .from('product_performance_daily')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(20);

      if (error) console.error('Error fetching data:', error);
      else setData(performance || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading live data...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Command Center (Live Data)</h1>
      <div className="grid gap-4">
        {data.map((row) => (
          <div key={row.id} className="border p-4 rounded shadow bg-card text-card-foreground">
            <div className="flex justify-between">
              <span className="font-bold">{row.product_name}</span>
              <span className="text-muted-foreground">{row.report_date}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              <div>Spend: ฿{row.spend}</div>
              <div>Leads (Meta): {row.leads_meta}</div>
              <div>CPL: ฿{row.leads_meta ? (row.spend / row.leads_meta).toFixed(0) : 0}</div>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && <p>No data found yet. (Sync might be running)</p>}
    </div>
  );
};
const PerformanceLab = () => <div className="p-8"><h1 className="text-3xl font-bold">Performance Lab</h1><p>Creative & Audience Testing</p></div>;
const DeepAnalysis = () => <div className="p-8"><h1 className="text-3xl font-bold">Deep Analysis</h1><p>Advanced Data Breakdown</p></div>;
const BusinessMetrics = () => <div className="p-8"><h1 className="text-3xl font-bold">Business Metrics</h1><p>Financial Health & ROI</p></div>;

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background text-foreground">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card p-4 flex flex-col">
          <div className="mb-8 flex items-center gap-2 px-2">
            <div className="h-8 w-8 rounded bg-primary" />
            <span className="text-lg font-bold">Thailife Insights</span>
          </div>

          <nav className="space-y-2 flex-1">
            <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Command Center" />
            <NavLink to="/performance" icon={<Activity size={20} />} label="Performance Lab" />
            <NavLink to="/deep-analysis" icon={<BarChart2 size={20} />} label="Deep Analysis" />
            <NavLink to="/metrics" icon={<DollarSign size={20} />} label="Business Metrics" />
          </nav>

          <div className="border-t pt-2">
            <NavLink to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/performance" element={<PerformanceLab />} />
            <Route path="/deep-analysis" element={<DeepAnalysis />} />
            <Route path="/metrics" element={<BusinessMetrics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}

export default App;
