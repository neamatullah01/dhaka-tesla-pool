export function formatPaisa(paisa: number): string {
  const tk = paisa / 100;
  return `৳${tk.toFixed(2)}`;
}

export function formatMeters(m: number): string {
  return `${m.toLocaleString()} m`;
}

export function formatDate(date: string | Date | number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date));
}
