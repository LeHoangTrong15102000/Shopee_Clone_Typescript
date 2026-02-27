interface SkeletonBaseProps {
  className?: string
  children?: React.ReactNode
}

export default function SkeletonBase({ className = '', children }: SkeletonBaseProps) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-slate-600 rounded ${className}`}>{children}</div>
}
