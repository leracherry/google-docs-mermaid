import type { SelectHTMLAttributes } from 'react';

/** Keep native keyboard and menu behavior with consistent chevron spacing. */
export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <span className={`select-control ${className}`}>
    <select {...props}>{children}</select>
    <svg className="select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </span>;
}
