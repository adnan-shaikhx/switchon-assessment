import { memo, type KeyboardEvent } from 'react';
import { Thumbnail } from '@/features/assets/Thumbnail';
import { formatBytes, formatDate, statusLabel } from '@/lib/format';
import type { Asset } from '@/lib/types';

interface Props {
  asset: Asset;
  isSelected: boolean;
  isActive: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

function AssetCardImpl({ asset, isSelected, isActive, onToggleSelect, onOpen }: Props) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    
    event.preventDefault();
    onOpen(asset.id);
  }

  return (
    <div
      className={'card' + (isSelected ? ' card--selected' : '') + (isActive ? ' card--active' : '')}
      role="button"
      tabIndex={0}
      aria-label={asset.name}
      onClick={() => onOpen(asset.id)}
      onKeyDown={handleKeyDown}
    >
      <Thumbnail asset={asset} className="card__thumb" />
      <div className="card__body">
        <p className="card__name">{asset.name}</p>
        <p className="muted">
          {asset.kind} · {formatBytes(asset.sizeBytes)} · {formatDate(asset.updatedAt)}
        </p>
        <span className={`pill pill--${asset.status}`}>{statusLabel(asset.status)}</span>
      </div>
      <input
        type="checkbox"
        className="card__check"
        checked={isSelected}
        aria-label={`Select ${asset.name}`}
        onClick={(e) => e.stopPropagation()}
        onChange={() => onToggleSelect(asset.id)}
      />
    </div>
  );
}

export const AssetCard = memo(AssetCardImpl);
