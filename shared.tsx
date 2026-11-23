import type { Alert } from '@/types';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const severityConfig = {
  critical: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-900',
    iconColor: 'text-red-600',
    label: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-900',
    iconColor: 'text-amber-600',
    label: 'Warning',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    iconColor: 'text-blue-600',
    label: 'Info',
  },
};

export function AlertCard({ alert }: { alert: Alert }) {
  const cfg = severityConfig[alert.severity];
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-bold uppercase tracking-wide ${cfg.iconColor}`}>
            {cfg.label}
          </span>
          <span className="text-xs text-gray-500">{alert.category}</span>
        </div>
        <p className={`text-sm ${cfg.text}`}>{alert.message}</p>
      </div>
    </div>
  );
}

export function AlertsPanel({ maxItems = 5 }: { maxItems?: number }) {
  const { alerts } = useApp();
  const items = alerts.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center">No active alerts.</div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    low: 'bg-green-100 text-green-800 border-green-300',
    insufficient: 'bg-gray-100 text-gray-600 border-gray-300',
  };
  const labels: Record<string, string> = {
    high: 'High Risk',
    medium: 'Medium Risk',
    low: 'Low Risk',
    insufficient: 'Insufficient Data',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[level] ?? colors.insufficient}`}
    >
      {labels[level] ?? level}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  color = 'blue',
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: typeof AlertCircle;
  color?: 'blue' | 'red' | 'amber' | 'green' | 'gray';
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const iconColorMap = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
    green: 'text-green-600',
    gray: 'text-gray-600',
  };

  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
        </div>
        <Icon className={`w-8 h-8 ${iconColorMap[color]}`} />
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function DataQualityBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        ok
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-gray-400'}`} />
      {label}
    </span>
  );
}

export function DismissableNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-900">{children}</div>
    </div>
  );
}
