import { useCallback, useEffect, useMemo, useState } from 'react';
import { bulkSetStatus } from '@/api/client';
import { AssetDetail } from '@/features/assets/AssetDetail';
import { AssetGrid } from '@/features/assets/AssetGrid';
import { useAssets } from '@/features/assets/useAssets';
import { useQueryState } from '@/features/assets/useQueryState';
import { statusLabel, summarizeBulkResult } from '@/lib/format';
import type { Asset, AssetStatus, AssetQuery } from '@/lib/types';
import { debounce } from '@/utils';

const STATUSES: AssetStatus[] = ['draft', 'in_review', 'approved', 'archived'];
const SORTS: Array<{ value: NonNullable<AssetQuery['sort']>; label: string }> = [
  { value: 'updatedAt:desc', label: 'Recently updated' },
  { value: 'name:asc', label: 'Name A–Z' },
  { value: 'sizeBytes:desc', label: 'Largest first' },
  { value: 'createdAt:desc', label: 'Newest' },
];

// Trailing debounce: coalesces a burst of keystrokes into one request instead
// of one per character, keeping typing well under the 80-req/10s rate limit.
const SEARCH_DEBOUNCE_MS = 300;

export function App() {
  const [{ q, status, sort }, setQueryState] = useQueryState();
  const [qInput, setQInput] = useState(q);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const debouncedSetQ = useMemo(
    () => debounce((value: string) => setQueryState((prev) => ({ ...prev, q: value })), SEARCH_DEBOUNCE_MS),
    [setQueryState],
  );

  function handleSearchChange(value: string) {
    setQInput(value);
    debouncedSetQ(value);
  }

  function setStatusFilter(next: AssetStatus[]) {
    setQueryState((prev) => ({ ...prev, status: next }));
  }

  function setSort(next: NonNullable<AssetQuery['sort']>) {
    setQueryState((prev) => ({ ...prev, sort: next }));
  }

  const { items, total, loading, error, applyUpdates } = useAssets({ q, status, sort, limit: 24 });

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  async function applyBulkStatus(next: AssetStatus) {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setNotice(null);
    try {
      // Sends every selected id in one call, which the API refuses above 50.
      const result = await bulkSetStatus(ids, next);
      const updated: Asset[] = [];

      for (const item of result.results) {
        if (item.ok) updated.push(item.asset);
      }

      applyUpdates(updated);
      
      setNotice(summarizeBulkResult(result));
      setSelectedIds(new Set());
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Bulk update failed');
    }
  }

  function handleSaved(asset: Asset) {
    applyUpdates([asset]);
  }

  useEffect(() => debouncedSetQ.cancel, [debouncedSetQ]);

  return (
    <div className="app">
      <header className="topbar">
        <h1>MediaVault</h1>
        <input
          className="search"
          type="search"
          placeholder="Search assets"
          value={qInput}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </header>

      <div className="filters">
        {STATUSES.map((s) => (
          <label key={s}>
            <input
              type="checkbox"
              checked={status.includes(s)}
              onChange={(e) =>
                setStatusFilter(e.target.checked ? [...status, s] : status.filter((x) => x !== s))
              }
            />
            {statusLabel(s)}
          </label>
        ))}
        <span className="muted">
          {loading ? 'Loading…' : `${items.length} of ${total.toLocaleString()} shown`}
        </span>
      </div>

      {selectedIds.size > 0 && (
        <div className="bulkbar">
          <span>{selectedIds.size} selected</span>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => applyBulkStatus(s)}>
              Set {statusLabel(s).toLowerCase()}
            </button>
          ))}
          <button onClick={() => setSelectedIds(new Set())}>Clear selection</button>
        </div>
      )}

      {notice && <p className="notice">{notice}</p>}
      {error && <p className="error">{error}</p>}

      <main className="content">
        <AssetGrid
          assets={items}
          selectedIds={selectedIds}
          activeId={activeId}
          onToggleSelect={toggleSelect}
          onOpen={setActiveId}
        />
        {activeId && (
          <AssetDetail id={activeId} onClose={() => setActiveId(null)} onSaved={handleSaved} />
        )}
      </main>
    </div>
  );
}
