import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Activity, BarChart2, DollarSign, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Admin from './pages/Admin';

// Real Data Component
const CommandCenter = () => {
  const [data, setData] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Data
      const { data: performance, error: perfError } = await supabase
        .from('product_performance_daily')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);

      // Fetch Mappings
      const { data: mapData, error: mapError } = await supabase
        .from('product_mappings')
        .select('product_code, product_name');

      if (perfError) console.error('Error fetching data:', perfError);
      if (mapError) console.error('Error fetching mappings:', mapError);

      // Create Map
      const mapObj: Record<string, string> = {};
      mapData?.forEach(m => {
        if (!mapObj[m.product_code]) {
          mapObj[m.product_code] = m.product_name;
        }
      });

      setMappings(mapObj);
      setData(performance || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        Command Center
        <span className="text-sm font-normal text-muted-foreground px-3 py-1 bg-muted rounded-full">Live Data</span>
      </h1>
      <div className="grid gap-4">
        {data.map((row) => (
          <div key={row.id} className="border p-5 rounded-xl shadow-sm bg-card text-card-foreground hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-primary">{mappings[row.product_code] || row.product_code}</h3>
                <p className="text-sm text-muted-foreground font-mono mt-1">{row.product_code}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-muted rounded">{row.date}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Spend</p>
                <p className="font-semibold text-lg">฿{Number(row.spend).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-center border-l border-r">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Leads</p>
                <p className="font-semibold text-lg">{row.meta_leads}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cost / Lead</p>
                <p className={`font-semibold text-lg ${row.meta_leads > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  ฿{row.meta_leads ? (row.spend / row.meta_leads).toFixed(0) : '-'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border-dashed border-2">
          No performance data found. (Sync might be running)
        </div>
      )}
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
            <NavLink to="/admin" icon={<ShieldCheck size={20} />} label="Admin" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/performance" element={<PerformanceLab />} />
            <Route path="/deep-analysis" element={<DeepAnalysis />} />
            <Route path="/metrics" element={<BusinessMetrics />} />
            <Route path="/admin" element={<Admin />} />
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
