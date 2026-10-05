import { AlertTriangle, LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Loading your library…' }: { label?: string }) {
  return <div className="state-box"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="error-state" role="alert">
      <span className="error-icon"><AlertTriangle size={19} /></span>
      <div><strong>We couldn’t load this page</strong><p>{message}</p></div>
      <button className="button button-secondary" onClick={onRetry}>Try again</button>
    </div>
  );
}
