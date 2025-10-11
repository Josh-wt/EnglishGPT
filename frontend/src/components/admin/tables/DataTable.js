import React, { useState } from 'react';

const LongText = ({ text, max = 120 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return '—';
  const content = expanded ? text : String(text).slice(0, max) + (String(text).length > max ? '…' : '');
  return (
    <div className="space-y-1">
      <div className="whitespace-pre-wrap break-words">{content}</div>
      <div className="flex gap-2 text-xs text-blue-600">
        {String(text).length > max && (
          <button className="underline" onClick={() => setExpanded(v => !v)}>{expanded ? 'Show less' : 'Expand'}</button>
        )}
        <button className="underline" onClick={() => navigator.clipboard.writeText(String(text))}>Copy</button>
      </div>
    </div>
  );
};

const DataTable = ({ columns, data, footer, toolbar, emptyMessage = 'No data', loading, onSortChange, sortBy, sortDir }) => {
  const handleSort = (col) => {
    if (!onSortChange || !col.sortable) return;
    const nextDir = sortBy === (col.sortKey || col.accessor) && sortDir === 'asc' ? 'desc' : 'asc';
    onSortChange(col.sortKey || col.accessor, nextDir);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {toolbar && <div className="p-4 border-b border-gray-200 dark:border-gray-700">{toolbar}</div>}
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/20">
            <tr>
              {columns.map(col => (
                <th key={col.id || col.accessor} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className={`flex items-center gap-1 ${col.sortable ? '' : 'cursor-default'}`} onClick={() => handleSort(col)}>
                    <span>{col.header}</span>
                    {col.sortable && sortBy === (col.sortKey || col.accessor) && (
                      <span>{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((c, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : data?.length ? (
              data.map((row, i) => (
                <tr key={row.id || row.uid || i} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3 text-sm">
                      {col.longText ? <LongText text={col.cell ? col.cell(row) ?? row[col.accessor] : row[col.accessor]} max={col.max || 120} /> : (col.cell ? col.cell(row) : row[col.accessor])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-gray-500">{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {footer && <div className="p-3 border-t border-gray-200 dark:border-gray-700">{footer}</div>}
    </div>
  );
};

export default DataTable;
export { LongText };

