export default function DashboardCard({ label, value, icon: Icon, tone = '' }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value ?? 0}</strong>
      </div>
      <span className="stat-icon">
        <Icon size={22} />
      </span>
    </article>
  );
}
