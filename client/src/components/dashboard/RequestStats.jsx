import {
  Files,
  Clock,
  LoaderCircle,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import DashboardCard from './DashboardCard';
export default function RequestStats({ data, showOpen = false }) {
  const cards = [
    { key: 'total', label: 'Total requests', icon: Files },
    { key: 'pending', label: 'Pending', icon: Clock, tone: 'amber' },
    {
      key: 'in_progress',
      label: 'In progress',
      icon: LoaderCircle,
      tone: 'blue',
    },
    { key: 'resolved', label: 'Resolved', icon: CheckCircle2, tone: 'green' },
  ];
  if (showOpen)
    cards.push({ key: 'open', label: 'Open requests', icon: FolderOpen });
  return (
    <div className={`stats-grid ${showOpen ? 'admin-stats' : ''}`}>
      {cards.map(({ key, ...card }) => (
        <DashboardCard key={key} {...card} value={data[key]} />
      ))}
    </div>
  );
}
