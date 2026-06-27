interface TrendChartProps {
  title: string;
  subtitle?: string;
  data: { date: string; value: number }[];
}

const TrendChart = ({ title, subtitle, data }: TrendChartProps) => {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gold-200 bg-cream-25 text-sm text-gray-400">
        No data yet
      </div>
    );
  }

  const W = 800;
  const H = 220;
  const pad = { l: 40, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const maxV = Math.max(1, ...data.map((d) => d.value));
  const step = innerW / Math.max(1, data.length - 1);

  const points = data
    .map((d, i) => {
      const x = pad.l + i * step;
      const y = pad.t + innerH - (d.value / maxV) * innerH;
      return `${x},${y}`;
    })
    .join(' ');

  const area = `${pad.l},${pad.t + innerH} ${points} ${pad.l + innerW},${pad.t + innerH}`;

  return (
    <div className="rounded-lg border border-gold-200 bg-cream-25 p-5 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          {subtitle && <p className="vc-wordmark text-[10px] text-gold-700">{subtitle}</p>}
          <h3 className="font-serif text-xl text-primary-900">{title}</h3>
        </div>
        <p className="text-xs text-gray-400">Peak {maxV.toLocaleString('en-IN')}</p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F4C3A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0F4C3A" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.t + innerH * (1 - t);
          return (
            <g key={t}>
              <line
                x1={pad.l}
                y1={y}
                x2={pad.l + innerW}
                y2={y}
                stroke="#F2E6B6"
                strokeDasharray="2 4"
              />
              <text x={pad.l - 6} y={y + 4} fontSize="10" textAnchor="end" fill="#9A6F08">
                {Math.round(maxV * t).toLocaleString('en-IN')}
              </text>
            </g>
          );
        })}
        <polygon points={area} fill="url(#trendFill)" />
        <polyline points={points} fill="none" stroke="#0F4C3A" strokeWidth="2" />
        {data.map((d, i) => {
          if (i % 5 !== 0 && i !== data.length - 1) return null;
          const x = pad.l + i * step;
          return (
            <text key={d.date} x={x} y={H - 8} fontSize="10" textAnchor="middle" fill="#9A6F08">
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default TrendChart;
