type SkeletonProps = {
	className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
	return <div className={`animate-pulse rounded-lg bg-surface-soft ${className}`} aria-hidden="true" />;
}