import { useApp } from '@/context/AppContext';
import { HAZARD_LABELS } from '@/data/demoData';
import {
  LayoutDashboard,
  Map,
  Upload,
  AlertTriangle,
  Building2,
  Navigation,
  FileText,
  ShieldAlert,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import type { PageId } from '@/types';

const NAV_ITEMS: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'risk-map', label: 'Interactive Risk Map', icon: Map },
  { id: 'data-upload', label: 'Data Upload & Validation', icon: Upload },
  { id: 'hazard-assessment', label: 'Hazard Assessment', icon: AlertTriangle },
  { id: 'shelter-capacity', label: 'Shelter Capacity', icon: Building2 },
  { id: 'safe-location', label: 'Safe Location & Routes', icon: Navigation },
  { id: 'reports', label: 'Reports & Methodology', icon: FileText },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const {
    currentPage,
    setCurrentPage,
    hazard,
    setHazard,
    sidebarOpen,
    setSidebarOpen,
    alerts,
  } = useApp();

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-slate-300 z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">
              Disaster Risk
            </div>
            <div className="text-slate-400 text-xs leading-tight">
              Identification System
            </div>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4" />}
                {item.id === 'overview' && criticalCount > 0 && !active && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {criticalCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Hazard selector */}
        <div className="px-4 py-4 border-t border-slate-700">
          <div className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">
            Hazard Type
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {(['flood', 'heat', 'landslide', 'other'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHazard(h)}
                className={`px-2 py-2 rounded-md text-xs font-medium transition-all ${
                  hazard === h
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {HAZARD_LABELS[h]}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-500">
          Prototype • Synthetic demo data
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-semibold text-gray-900 text-sm">
            Disaster Risk System
          </span>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
