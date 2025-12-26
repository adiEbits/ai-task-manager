/**
 * PageSkeleton Component
 * Full page loading placeholder with header and content
 * 
 * @module components/common/PageSkeleton
 */

import type { JSX } from 'react';
import Skeleton from './Skeleton';
import StatCardSkeleton from './StatCardSkeleton';

interface PageSkeletonProps {
  variant?: 'default' | 'table' | 'cards' | 'dashboard';
}

export default function PageSkeleton({ variant = 'default' }: PageSkeletonProps): JSX.Element {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded" width={40} height={40} />
          <div className="space-y-2">
            <Skeleton variant="text" height={28} width={200} />
            <Skeleton variant="text" height={16} width={300} />
          </div>
        </div>
        <Skeleton variant="rounded" width={120} height={44} />
      </div>

      {/* Stats - for dashboard variant */}
      {(variant === 'dashboard' || variant === 'default') && (
        <StatCardSkeleton count={4} />
      )}

      {/* Search/Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton variant="rounded" height={44} className="flex-1 max-w-xl" />
        <Skeleton variant="rounded" width={100} height={44} />
      </div>

      {/* Content based on variant */}
      {variant === 'table' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <th key={index} className="px-6 py-3 text-left">
                      <Skeleton variant="text" height={14} width={80} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton variant="circular" width={40} height={40} />
                        <div className="space-y-2">
                          <Skeleton variant="text" height={14} width={120} />
                          <Skeleton variant="text" height={12} width={160} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="rounded" height={24} width={70} />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" height={14} width={80} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Skeleton variant="rounded" width={32} height={32} />
                        <Skeleton variant="rounded" width={32} height={32} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {variant === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="space-y-2">
                  <Skeleton variant="text" height={18} width={120} />
                  <Skeleton variant="text" height={14} width={80} />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" height={14} className="w-full" />
                <Skeleton variant="text" height={14} className="w-3/4" />
              </div>
              <div className="flex gap-2">
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={60} height={24} />
              </div>
            </div>
          ))}
        </div>
      )}

      {(variant === 'default' || variant === 'dashboard') && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 pl-6 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200" />
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="text" height={20} className="w-3/4" />
                  </div>
                  <div className="ml-8 space-y-2 mb-3">
                    <Skeleton variant="text" height={14} className="w-full" />
                    <Skeleton variant="text" height={14} className="w-2/3" />
                  </div>
                  <div className="flex gap-2 ml-8">
                    <Skeleton variant="rounded" width={70} height={24} />
                    <Skeleton variant="rounded" width={60} height={24} />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Skeleton variant="rounded" width={32} height={32} />
                  <Skeleton variant="rounded" width={32} height={32} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}