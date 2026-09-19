import type { AssetStatus, BulkResult } from './types';

const UNITS = ['B', 'KB', 'MB', 'GB'];

export function formatBytes(bytes: number): string {
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 && unit > 0 ? value.toFixed(1) : Math.round(value)} ${UNITS[unit]}`;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const STATUS_LABELS: Record<AssetStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  approved: 'Approved',
  archived: 'Archived',
};

export function statusLabel(status: AssetStatus): string {
  return STATUS_LABELS[status];
}

const FAILURE_REASON_LABELS: Record<string, string> = {
  legal_hold: 'on legal hold',
  conflict: 'changed by someone else',
  not_found: 'no longer exists',
};

export function summarizeBulkResult(result: BulkResult): string {
  if (result.failed === 0) {
    return `${result.applied} asset${result.applied === 1 ? '' : 's'} updated.`;
  }

  const reasonCounts = new Map<string, number>();
  for (const item of result.results) {
    if (item.ok) continue;
    reasonCounts.set(item.code, (reasonCounts.get(item.code) ?? 0) + 1);
  }

  const reasons = [...reasonCounts.entries()]
    .map(([code, count]) => `${count} ${FAILURE_REASON_LABELS[code] ?? code}`)
    .join(', ');

  return `${result.applied} updated, ${result.failed} failed (${reasons}).`;
}
