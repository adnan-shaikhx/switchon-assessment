import { useEffect, useRef, useState } from 'react';
import type { AssetStatus, AssetQuery } from '@/lib/types';

export interface QueryState {
  q: string;
  status: AssetStatus[];
  sort: NonNullable<AssetQuery['sort']>;
}

const DEFAULT_SORT: QueryState['sort'] = 'updatedAt:desc';

function parseQueryState(search: string): QueryState {
  const params = new URLSearchParams(search);
  const status = params.get('status');
  const sort = params.get('sort');

  return {
    q: params.get('q') ?? '',
    status: status ? (status.split(',') as AssetStatus[]) : [],
    sort: (sort as QueryState['sort']) || DEFAULT_SORT,
  };
}

function serializeQueryState({ q, status, sort }: QueryState): string {
  const params = new URLSearchParams();

  if (q) params.set('q', q);
  if (status.length) params.set('status', status.join(','));
  if (sort !== DEFAULT_SORT) params.set('sort', sort);

  return params.toString();
}

// this persist filter on refresh and share 
export function useQueryState() {
  const [state, setState] = useState<QueryState>(() => parseQueryState(window.location.search));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const search = serializeQueryState(state);
    const url = search ? `${window.location.pathname}?${search}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [state]);

  return [state, setState] as const;
}
