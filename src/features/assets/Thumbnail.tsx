import { useState } from 'react';
import { thumbnailUrl } from '@/api/client';
import type { Asset } from '@/lib/types';

interface Props {
  asset: Pick<Asset, 'id' | 'kind' | 'hasThumbnail'>;
  className?: string;
}

/**
 * Renders the asset's thumbnail, or a kind-based placeholder when the asset
 * has none (`hasThumbnail: false`) or the image request itself fails.
 */
export function Thumbnail({ asset, className }: Props) {
  const [failed, setFailed] = useState(false);
  const classes = className ? `${className} thumb-placeholder` : 'thumb-placeholder';

  if (!asset.hasThumbnail || failed) {
    return (
      <div className={classes} aria-hidden="true">
        <KindIcon kind={asset.kind} />
      </div>
    );
  }

  return (
    <img
      className={className}
      src={thumbnailUrl(asset.id)}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function KindIcon({ kind }: { kind: Asset['kind'] }) {
  switch (kind) {
    case 'video':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'document':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2.5h9l4.5 4.5V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" />
          <path d="M15 2.5V7h4.5" />
        </svg>
      );
    case 'image':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2.5" y="4" width="19" height="16" rx="2" />
          <circle cx="8.5" cy="9.5" r="1.75" fill="currentColor" stroke="none" />
          <path d="M2.5 16.5l5.5-5 4 3.5 3-2.5 6.5 5.5" />
        </svg>
      );
  }
}
