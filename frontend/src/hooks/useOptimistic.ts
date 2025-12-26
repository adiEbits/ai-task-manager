/**
 * useOptimistic Hook
 * Provides optimistic UI updates with automatic rollback on error
 * 
 * @module hooks/useOptimistic
 */

import { useState, useCallback, useRef } from 'react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useOptimistic');

// ============================================
// Types
// ============================================

interface OptimisticState<T> {
  data: T;
  isOptimistic: boolean;
  error: Error | null;
}

interface UseOptimisticOptions<T> {
  onError?: (error: Error, rollbackData: T) => void;
  onSuccess?: (data: T) => void;
}

interface UseOptimisticReturn<T> {
  data: T;
  isOptimistic: boolean;
  error: Error | null;
  update: (
    optimisticData: T,
    asyncOperation: () => Promise<T>
  ) => Promise<T | undefined>;
  reset: () => void;
}

// ============================================
// Hook
// ============================================

/**
 * Hook for optimistic UI updates with automatic rollback
 * 
 * @example
 * const { data: task, update, isOptimistic } = useOptimistic(initialTask);
 * 
 * // Optimistically update, rollback on error
 * await update(
 *   { ...task, status: 'completed' },
 *   () => taskService.updateTask(task.id, { status: 'completed' })
 * );
 */
export function useOptimistic<T>(
  initialData: T,
  options?: UseOptimisticOptions<T>
): UseOptimisticReturn<T> {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    error: null,
  });

  const previousDataRef = useRef<T>(initialData);

  const update = useCallback(
    async (
      optimisticData: T,
      asyncOperation: () => Promise<T>
    ): Promise<T | undefined> => {
      // Store previous data for rollback
      previousDataRef.current = state.data;

      // Optimistically update UI
      setState({
        data: optimisticData,
        isOptimistic: true,
        error: null,
      });

      logger.debug('Optimistic update applied', { optimisticData });

      try {
        // Perform actual async operation
        const result = await asyncOperation();

        // Update with server response
        setState({
          data: result,
          isOptimistic: false,
          error: null,
        });

        logger.info('Optimistic update confirmed', { result });
        options?.onSuccess?.(result);

        return result;
      } catch (error) {
        const err = error as Error;

        // Rollback to previous data
        setState({
          data: previousDataRef.current,
          isOptimistic: false,
          error: err,
        });

        logger.error('Optimistic update failed, rolling back', err);
        options?.onError?.(err, previousDataRef.current);

        return undefined;
      }
    },
    [state.data, options]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isOptimistic: false,
      error: null,
    });
  }, [initialData]);

  return {
    data: state.data,
    isOptimistic: state.isOptimistic,
    error: state.error,
    update,
    reset,
  };
}

// ============================================
// List Optimistic Hook
// ============================================

interface UseOptimisticListReturn<T extends { id: string }> {
  items: T[];
  isOptimistic: boolean;
  optimisticIds: Set<string>;
  addItem: (item: T, asyncOperation: () => Promise<T>) => Promise<T | undefined>;
  updateItem: (id: string, updates: Partial<T>, asyncOperation: () => Promise<T>) => Promise<T | undefined>;
  removeItem: (id: string, asyncOperation: () => Promise<void>) => Promise<boolean>;
  setItems: (items: T[]) => void;
}

/**
 * Hook for optimistic list operations
 * 
 * @example
 * const { items: tasks, addItem, updateItem, removeItem } = useOptimisticList(initialTasks);
 * 
 * // Add task optimistically
 * await addItem(newTask, () => taskService.createTask(newTask));
 * 
 * // Update task optimistically
 * await updateItem(taskId, { status: 'completed' }, () => taskService.updateTask(taskId, { status: 'completed' }));
 * 
 * // Remove task optimistically
 * await removeItem(taskId, () => taskService.deleteTask(taskId));
 */
export function useOptimisticList<T extends { id: string }>(
  initialItems: T[],
  options?: UseOptimisticOptions<T[]>
): UseOptimisticListReturn<T> {
  const [items, setItemsState] = useState<T[]>(initialItems);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const [optimisticIds, setOptimisticIds] = useState<Set<string>>(new Set());
  
  const previousItemsRef = useRef<T[]>(initialItems);

  // Update items externally (e.g., from API fetch)
  const setItems = useCallback((newItems: T[]) => {
    setItemsState(newItems);
    previousItemsRef.current = newItems;
    setOptimisticIds(new Set());
    setIsOptimistic(false);
  }, []);

  // Add item optimistically
  const addItem = useCallback(
    async (item: T, asyncOperation: () => Promise<T>): Promise<T | undefined> => {
      previousItemsRef.current = items;
      
      // Add optimistically
      setItemsState((prev) => [item, ...prev]);
      setOptimisticIds((prev) => new Set(prev).add(item.id));
      setIsOptimistic(true);

      logger.debug('Optimistic add', { itemId: item.id });

      try {
        const result = await asyncOperation();
        
        // Replace temp item with server response
        setItemsState((prev) => 
          prev.map((i) => (i.id === item.id ? result : i))
        );
        setOptimisticIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
        setIsOptimistic(false);

        logger.info('Optimistic add confirmed', { itemId: result.id });
        return result;
      } catch (error) {
        // Rollback
        setItemsState(previousItemsRef.current);
        setOptimisticIds(new Set());
        setIsOptimistic(false);

        logger.error('Optimistic add failed', error as Error);
        options?.onError?.(error as Error, previousItemsRef.current);
        return undefined;
      }
    },
    [items, options]
  );

  // Update item optimistically
  const updateItem = useCallback(
    async (
      id: string,
      updates: Partial<T>,
      asyncOperation: () => Promise<T>
    ): Promise<T | undefined> => {
      previousItemsRef.current = items;
      
      // Update optimistically
      setItemsState((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      );
      setOptimisticIds((prev) => new Set(prev).add(id));
      setIsOptimistic(true);

      logger.debug('Optimistic update', { itemId: id, updates });

      try {
        const result = await asyncOperation();
        
        // Update with server response
        setItemsState((prev) =>
          prev.map((item) => (item.id === id ? result : item))
        );
        setOptimisticIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setIsOptimistic(false);

        logger.info('Optimistic update confirmed', { itemId: id });
        return result;
      } catch (error) {
        // Rollback
        setItemsState(previousItemsRef.current);
        setOptimisticIds(new Set());
        setIsOptimistic(false);

        logger.error('Optimistic update failed', error as Error);
        options?.onError?.(error as Error, previousItemsRef.current);
        return undefined;
      }
    },
    [items, options]
  );

  // Remove item optimistically
  const removeItem = useCallback(
    async (id: string, asyncOperation: () => Promise<void>): Promise<boolean> => {
      previousItemsRef.current = items;
      
      // Remove optimistically
      setItemsState((prev) => prev.filter((item) => item.id !== id));
      setIsOptimistic(true);

      logger.debug('Optimistic remove', { itemId: id });

      try {
        await asyncOperation();
        setIsOptimistic(false);

        logger.info('Optimistic remove confirmed', { itemId: id });
        return true;
      } catch (error) {
        // Rollback
        setItemsState(previousItemsRef.current);
        setIsOptimistic(false);

        logger.error('Optimistic remove failed', error as Error);
        options?.onError?.(error as Error, previousItemsRef.current);
        return false;
      }
    },
    [items, options]
  );

  return {
    items,
    isOptimistic,
    optimisticIds,
    addItem,
    updateItem,
    removeItem,
    setItems,
  };
}