import React from 'react';
import GlassCard from './GlassCard';

const DataTable = ({ columns, data, onRowClick }) => {
  return (
    <GlassCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#ffffff0f] bg-[#ffffff05]">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 font-mono text-xs tracking-wider text-es-text-muted uppercase ${col.align === 'right' ? 'text-right' : ''} ${col.align === 'center' ? 'text-center' : ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ffffff0a]">
            {data.map((row, idx) => (
              <tr 
                key={idx} 
                className={`hover:bg-[#ffffff05] transition-es ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 font-sans text-sm text-es-text-primary whitespace-nowrap ${col.align === 'right' ? 'text-right' : ''} ${col.align === 'center' ? 'text-center' : ''}`}>
                    {col.cell ? col.cell(row) : row[col.accessorKey]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="p-8 text-center text-es-text-muted font-sans text-sm">
            No records found.
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default DataTable;