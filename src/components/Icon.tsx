const paths = {
  minus: 'M5 12h14', plus: 'M5 12h14M12 5v14',
  expand: 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5',
  fit: 'M4 8V4h4M16 4h4v4M4 16v4h4M16 20h4v-4M8 8h8v8H8z',
  copy: 'M8 8h12v12H8zM16 8V4H4v12h4',
  close: 'm6 6 12 12M6 18 18 6',
  warning: 'm12 3 10 18H2L12 3zM12 9v5M12 17h.01',
};
export function Icon({ name }: { name: keyof typeof paths }) {
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
