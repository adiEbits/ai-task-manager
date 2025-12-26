/**
 * TableSkeleton Component
 * Loading placeholder for data tables
 * 
 * @module components/common/TableSkeleton
 */

import type { JSX } from 'react';
import Skeleton from './Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export default function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}: TableSkeletonProps): JSX.Element {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {showHeader && (
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-6 py-3 text-left">
                    <Skeleton variant="text" height={14} width={80} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {colIndex === 0 ? (
                      // First column - user/item with avatar
                      <div className="flex items-center gap-3">
                        <Skeleton variant="circular" width={40} height={40} />
                        <div className="space-y-2">
                          <Skeleton variant="text" height={14} width={120} />
                          <Skeleton variant="text" height={12} width={160} />
                        </div>
                      </div>
                    ) : colIndex === columns - 1 ? (
                      // Last column - actions
                      <div className="flex items-center gap-1">
                        <Skeleton variant="rounded" width={32} height={32} />
                        <Skeleton variant="rounded" width={32} height={32} />
                        <Skeleton variant="rounded" width={32} height={32} />
                      </div>
                    ) : (
                      // Middle columns - badges/text
                      <Skeleton variant="rounded" height={24} width={70} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}