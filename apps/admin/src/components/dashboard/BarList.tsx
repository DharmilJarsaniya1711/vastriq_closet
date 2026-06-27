interface BarListProps {
  title: string;
  subtitle?: string;
  items: { name: string; count: number }[];
}

const BarList = ({ title, subtitle, items }: BarListProps) => {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <div className="rounded-lg border border-gold-200 bg-cream-25 p-5 shadow-sm">
      <div className="mb-4">
        {subtitle && <p className="vc-wordmark text-[10px] text-gold-700">{subtitle}</p>}
        <h3 className="font-serif text-xl text-primary-900">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet</p>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.name}>
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span className="font-medium text-primary-900">{i.name}</span>
                <span>{i.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-cream-100">
                <div
                  className="h-full rounded bg-primary-900"
                  style={{ width: `${(i.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BarList;
