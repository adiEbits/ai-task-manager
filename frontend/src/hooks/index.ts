/**
 * Hooks Barrel Export
 * Centralized export for all custom hooks
 * 
 * @module hooks
 */

// ============================================
// Common Hooks (from hooks.ts)
// ============================================

export {
  // Debounce
  useDebounce,
  
  // Local Storage
  useLocalStorage,
  
  // Click Outside
  useClickOutside,
  
  // Async Operations
  useAsync,
  
  // Toggle
  useToggle,
  
  // Previous Value
  usePrevious,
  
  // Media Queries
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  
  // Key Press
  useKeyPress,
  
  // Interval
  useInterval,
  
  // Document Title
  useDocumentTitle,
} from './hooks';

// ============================================
// Keyboard Shortcuts
// ============================================

export { 
  useKeyboardShortcuts, 
  getShortcutDisplay, 
  KEYBOARD_SHORTCUTS 
} from './useKeyboardShortcuts';

// ============================================
// Optimistic Updates
// ============================================

export { 
  useOptimistic, 
  useOptimisticList 
} from './useOptimistic';