/**
 * TaskCardSkeleton Component
 * Loading placeholder for task cards
 * 
 * @module components/common/TaskCardSkeleton
 */

import type { JSX } from 'react';
import Skeleton from './Skeleton';

interface TaskCardSkeletonProps {
  count?: number;
}

function SingleTaskCardSkeleton(): JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 pl-6 relative overflow-hidden">
      {/* Priority indicator bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200" />
      
      <div className="flex justify-between items-start gap-4">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Title and status */}
          <div className="flex items-start gap-3 mb-3">
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" height={20} className="w-3/4" />
          </div>

          {/* Description */}
          <div className="ml-8 mb-3 space-y-2">
            <Skeleton variant="text" height={14} className="w-full" />
            <Skeleton variant="text" height={14} className="w-2/3" />
          </div>

          {/* Tags and metadata */}
          <div className="flex flex-wrap items-center gap-2 ml-8">
            <Skeleton variant="rounded" width={70} height={24} />
            <Skeleton variant="rounded" width={60} height={24} />
            <Skeleton variant="rounded" width={90} height={24} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Skeleton variant="rounded" width={32} height={32} />
          <Skeleton variant="rounded" width={32} height={32} />
          <Skeleton variant="rounded" width={32} height={32} />
        </div>
      </div>
    </div>
  );
}

export default function TaskCardSkeleton({ count = 3 }: TaskCardSkeletonProps): JSX.Element {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <SingleTaskCardSkeleton key={index} />
      ))}
    </div>
  );
}