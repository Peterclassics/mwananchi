import { LoaderCircle } from 'lucide-react';
export default function LoadingState() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={24} /> Loading your information…
    </div>
  );
}
