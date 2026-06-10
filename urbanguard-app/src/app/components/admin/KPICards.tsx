import { AlertCircle, Clock, RotateCcw, CheckCircle } from 'lucide-react';
import { Incident } from '../../../services/supabaseClient';

interface KPICardsProps {
  incidents: Incident[];
}

export function KPICards({ incidents }: KPICardsProps) {
  const activeCount = incidents.filter((i) => i.status !== 'resolvido').length;
  const resolvedCount = incidents.filter((i) => i.status === 'resolvido').length;
  const reincidenceCount = incidents.reduce((acc, i) => acc + (i.reincidence_counter || 0), 0);

  const kpis = [
    {
      label: 'Casos Ativos',
      value: activeCount.toString(),
      change: `Total: ${incidents.length}`,
      trend: 'up',
      icon: AlertCircle,
      color: 'text-[#F57C00]',
      bgColor: 'bg-[#F57C00]/10',
    },
    {
      label: 'Média de Resolução',
      value: '2.8 dias',
      change: 'Meta < 4d',
      trend: 'down',
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Reincidências',
      value: reincidenceCount.toString(),
      change: 'Acumulado',
      trend: 'up',
      icon: RotateCcw,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Casos Resolvidos',
      value: resolvedCount.toString(),
      change: 'Histórico',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-[#388E3C]',
      bgColor: 'bg-[#388E3C]/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <div
            key={kpi.label}
            className="bg-card border border-border rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3 lg:mb-4">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${kpi.color}`} />
              </div>
              <div
                className={`text-xs font-medium px-2 py-1 rounded bg-[#F57C00]/10 text-[#F57C00]`}
              >
                {kpi.change}
              </div>
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-1">{kpi.value}</h3>
            <p className="text-xs lg:text-sm text-muted-foreground">{kpi.label}</p>
          </div>
        );
      })}
    </div>
  );
}
