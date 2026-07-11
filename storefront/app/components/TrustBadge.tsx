export default function TrustBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red';
  const colorClasses = {
    green: { text: 'text-green-400' },
    yellow: { text: 'text-yellow-400' },
    red: { text: 'text-red-400' },
  }[color];

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-lg',
  }[size];

  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses} flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" className="text-white/5" strokeWidth="2" />
        <circle
          cx="20" cy="20" r="18" fill="none" stroke="currentColor"
          className={colorClasses.text}
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <span className={`font-bold ${colorClasses.text}`}>{Math.round(score)}</span>
    </div>
  );
}
