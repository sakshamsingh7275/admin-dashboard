import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const tip = (t) => ({ contentStyle: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text }, labelStyle: { color: t.muted } });
const tick = (t) => ({ fill: t.muted, fontSize: 12 });

export function VisitsChart({ data, theme: t }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={t.primary} stopOpacity={0.5} /><stop offset="100%" stopColor={t.primary} stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid stroke={t.border} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={tick(t)} stroke={t.border} />
        <YAxis allowDecimals={false} tick={tick(t)} stroke={t.border} />
        <Tooltip {...tip(t)} />
        <Legend />
        <Area type="monotone" dataKey="views" name="Page views" stroke={t.primary} fill="url(#g1)" strokeWidth={2} />
        <Area type="monotone" dataKey="visitors" name="Visitors" stroke={t.accent} fill="none" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CountryChart({ data, theme: t }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 30 }}>
        <CartesianGrid stroke={t.border} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={tick(t)} stroke={t.border} />
        <YAxis type="category" dataKey="name" width={120} tick={tick(t)} stroke={t.border} />
        <Tooltip {...tip(t)} cursor={{ fill: t.border, opacity: 0.3 }} />
        <Bar dataKey="value" name="Requests" fill={t.primary} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PieBlock({ data, theme: t }) {
  const colors = [t.primary, t.accent, '#60a5fa', '#818cf8', '#34d399', '#fbbf24', '#f472b6', '#fb923c'];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} stroke={t.surface}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip {...tip(t)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
