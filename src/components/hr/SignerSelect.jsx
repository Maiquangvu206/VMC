import React from 'react';
import { PenTool } from 'lucide-react';

export const SignerSelect = ({
  signers = [],
  selectedSignerId,
  onChange,
  label = 'Ký duyệt:',
  className = '',
  compact = false
}) => {
  if (!signers || signers.length === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {label && (
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
          <PenTool className="w-3 h-3 text-blue-400 shrink-0" />
          <span>{label}</span>
        </span>
      )}
      <select
        value={selectedSignerId || (signers[0] && signers[0].id) || ''}
        onChange={e => onChange(e.target.value)}
        className={`bg-slate-800 text-slate-200 text-xs py-1 px-2 rounded border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer ${compact ? 'max-w-[170px]' : 'max-w-[240px]'
          } truncate`}
        title="Chọn người ký duyệt"
      >
        {signers.map(s => (
          <option key={s.id} value={s.id} title={s.title || s.name}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SignerSelect;
