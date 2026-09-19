import Skeleton from 'react-loading-skeleton';

export function AssetCardSkeleton() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <div className="card__thumb">
        <Skeleton height="100%" inline style={{ display: 'block' }} />
      </div>
      <div className="card__body">
        <p className="card__name">
          <Skeleton width="70%" inline />
        </p>
        <p className="muted">
          <Skeleton width="90%" inline />
        </p>
        <span className="card__pill-skeleton">
          <Skeleton width={64} height={18} borderRadius={10} inline />
        </span>
      </div>
    </div>
  );
}
