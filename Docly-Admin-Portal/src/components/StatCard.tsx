import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  iconClass?: string;
  href?: string;
}

/** Reusable dashboard statistic card in Docly's card + card-hover style. */
const StatCard: React.FC<StatCardProps> = ({ icon, title, value, iconClass = 'bg-primary-bg text-primary', href }) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${iconClass}`}>{icon}</div>
      </div>
      {href && (
        <span className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
          View <ArrowRight className="h-3.5 w-3.5" />
        </span>
      )}
    </>
  );

  const classes = 'card card-hover p-5';

  if (href) {
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }
  return <div className={classes}>{content}</div>;
};

export default StatCard;