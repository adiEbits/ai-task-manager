/**
 * CardSkeleton Component
 * Generic loading placeholder for cards
 * 
 * @module components/common/CardSkeleton
 */

import type { JSX } from 'react';
import Skeleton from './Skeleton';

interface CardSkeletonProps {
  hasHeader?: boolean;
  hasImage?: boolean;
  lines?: number;
  hasFooter?: boolean;
}

export default function CardSkeleton({ 
  hasHeader = true, 
  hasImage = false,
  lines = 3,
  hasFooter = false 
}: CardSkeletonProps): JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Image placeholder */}
      {hasImage && (
        <Skeleton variant="rectangular" height={200} className="w-full" />
      )}

      {/* Header */}
      {hasHeader && (
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Skeleton variant="rounded" width={40} height={40} />
            <div className="space-y-2">
              <Skeleton variant="text" height={18} width={150} />
              <Skeleton variant="text" height={14} width={200} />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index} 
            variant="text" 
            height={14} 
            className={index === lines - 1 ? 'w-2/3' : 'w-full'} 
          />
        ))}
      </div>

      {/* Footer */}
      {hasFooter && (
        <div className="p-4 sm:p-6 border-t border-gray-100 flex justify-end gap-3">
          <Skeleton variant="rounded" width={80} height={36} />
          <Skeleton variant="rounded" width={100} height={36} />
        </div>
      )}
    </div>
  );
}