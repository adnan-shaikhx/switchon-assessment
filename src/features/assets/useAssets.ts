import { useEffect, useState } from 'react';
import { listAssets } from '@/api/client';
import type { Asset, AssetQuery, AssetStatus } from '@/lib/types';

interface State {
  items: Asset[];
  total: number;
  nextCursor: string | null;
  loading: boolean;
  error: string | null;
}

function matchesStatus(asset: Asset, status?: AssetStatus[]): boolean {
  if (!status || status.length === 0) return true;

  return status.includes(asset.status);
}

/**
 * Baseline loader. Reviewers know this hook is wrong in several ways.
 * Replacing it wholesale is expected and encouraged.
 */
export function useAssets(query: AssetQuery) {
  const [state, setState] = useState<State>({
    items: [],
    total: 0,
    nextCursor: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    listAssets(query)
      .then((page) => {
        setState({
          items: page.items,
          total: page.total,
          nextCursor: page.nextCursor,
          loading: false,
          error: null,
        });
      })
      .catch((err: unknown) => {
        setState((s) => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : 'Something went wrong',
        }));
      });
  }, [JSON.stringify(query)]);

  function applyUpdates(updated: Asset[]) {
    setState((s) => {
      const byId = new Map(updated.map((asset) => [asset.id, asset]));
      let removed = 0;

      const items = s.items.reduce<Asset[]>((acc, item) => {
        const next = byId.get(item.id);

        if (!next) {
          acc.push(item);
          return acc;
        }

        if (matchesStatus(next, query.status)) {
          acc.push(next);
        } else {
          removed += 1;
        }

        return acc;
      }, []);

      return { ...s, items, total: s.total - removed };
    });
  }

  return { ...state, applyUpdates };
}
