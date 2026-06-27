import { Icon } from '@iconify-icon/react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
}

const KpiCard = ({ label, value, icon, trend }: KpiCardProps) => (
  <div className="rounded-lg border border-gold-200 bg-cream-25 p-5 shadow-sm">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-3 font-serif text-3xl text-primary-900">{value}</p>
        {trend && <p className="mt-1 text-xs text-gray-400">{trend}</p>}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-900">
        <Icon icon={icon} width={20} />
      </div>
    </div>
  </div>
);

export default KpiCard;
