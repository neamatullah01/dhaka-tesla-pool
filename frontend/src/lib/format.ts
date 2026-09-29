export function formatPaisa(paisa: number): string {
  const tk = paisa / 100;
  return `৳${tk.toFixed(2)}`;
}

export function formatMeters(m: number): string {
  return `${m.toLocaleString()} m`;
}
