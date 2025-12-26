/**
 * StatCardSkeleton Component
 * Loading placeholder for statistics cards
 * 
 * @module components/common/StatCardSkeleton
 */

import type { JSX } from 'react';
import Skeleton from './Skeleton';

interface StatCardSkeletonProps {
  count?: number;
}

function SingleStatCardSkeleton(): JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton variant="text" height={14} width={80} />
          <Skeleton variant="text" height={32} width={60} />
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" width={16} height={16} />
            <Skeleton variant="text" height={14} width={50} />
          </div>
        </div>
        <Skeleton variant="rounded" width={48} height={48} />
      </div>
    </div>
  );
}

export default function StatCardSkeleton({ count = 4 }: StatCardSkeletonProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SingleStatCardSkeleton key={index} />
      ))}
    </div>
  );
}