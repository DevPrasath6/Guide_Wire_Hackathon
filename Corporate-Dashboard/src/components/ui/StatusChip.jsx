import React from 'react';

const StatusChip = ({ status }) => {
  const styles = {
    approved: 'bg-es-teal/15 text-es-teal border-es-teal/30',
    pending: 'bg-es-amber/15 text-es-amber border-es-amber/30',
    rejected: 'bg-es-red/15 text-es-red border-es-red/30',
    flagged: 'bg-es-purple/15 text-es-purple border-es-purple/30',
    escalated: 'bg-es-purple/15 text-es-purple border-es-purple/30',
    high: 'bg-es-red/15 text-es-red border-es-red/30',
    medium: 'bg-es-amber/15 text-es-amber border-es-amber/30',
    low: 'bg-es-teal/15 text-es-teal border-es-teal/30',
  };

  const statusKey = status?.toLowerCase() || 'pending';
  const appliedStyle = styles[statusKey] || styles.pending;

  return (
    <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg border text-[11px] font-sans font-medium uppercase tracking-wide ${appliedStyle}`}>
      {status}
    </span>
  );
};

export default StatusChip;