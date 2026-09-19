import { AssetCard } from '@/features/assets/AssetCard';
import { AssetCardSkeleton } from '@/features/assets/AssetCardSkeleton';
import type { Asset } from '@/lib/types';

interface Props {
  assets: Asset[];
  selectedIds: Set<string>;
  activeId: string | null;
  isLoading: boolean;
  skeletonCount: number;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export function AssetGrid({
  assets,
  selectedIds,
  activeId,
  isLoading,
  skeletonCount,
  onToggleSelect,
  onOpen,
}: Props) {
  if (isLoading) {
    return (
      <div className="grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <AssetCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="empty">
        <p>Nothing matches these filters.</p>
        <p className="muted">Clear the search box or widen the status filter.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isSelected={selectedIds.has(asset.id)}
          isActive={activeId === asset.id}
          onToggleSelect={onToggleSelect}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
