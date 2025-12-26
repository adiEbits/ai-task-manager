/**
 * useKeyboardShortcuts Hook
 * Global keyboard shortcuts handler
 * 
 * @module hooks/useKeyboardShortcuts
 */

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/stores/themeStore';

// ============================================
// Types
// ============================================

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  onOpenCommandPalette: () => void;
  enabled?: boolean;
}

// ============================================
// Hook
// ============================================

export function useKeyboardShortcuts({ 
  onOpenCommandPalette, 
  enabled = true 
}: UseKeyboardShortcutsOptions): void {
  const navigate = useNavigate();
  const { toggleTheme } = useThemeStore();

  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    // Don't trigger shortcuts when typing in inputs
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.isContentEditable;

    // Allow Escape and Ctrl+K even in inputs
    const allowInInput = e.key === 'Escape' || (e.ctrlKey && e.key === 'k');
    
    if (isInput && !allowInInput) return;

    // Define shortcuts
    const shortcuts: ShortcutConfig[] = [
      // Command Palette - Ctrl+K or Cmd+K
      {
        key: 'k',
        ctrl: true,
        action: () => {
          e.preventDefault();
          onOpenCommandPalette();
        },
        description: 'Open command palette',
      },
      // Theme Toggle - Ctrl+Shift+L
      {
        key: 'l',
        ctrl: true,
        shift: true,
        action: () => {
          e.preventDefault();
          toggleTheme();
        },
        description: 'Toggle dark mode',
      },
      // Navigation shortcuts using G prefix
      // These work with a sequence: G then D for Dashboard
    ];

    // Check each shortcut
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        shortcut.action();
        return;
      }
    }

    // Quick navigation shortcuts (no modifiers needed)
    if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
      // Press ? for help
      if (e.key === '?') {
        e.preventDefault();
        navigate('/help');
        return;
      }
    }
  }, [navigate, toggleTheme, onOpenCommandPalette]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

// ============================================
// Shortcut Display Helper
// ============================================

export function getShortcutDisplay(shortcut: string[]): string {
  return shortcut.map(key => {
    switch (key.toLowerCase()) {
      case 'ctrl':
        return '⌃';
      case 'cmd':
      case 'meta':
        return '⌘';
      case 'shift':
        return '⇧';
      case 'alt':
      case 'option':
        return '⌥';
      case 'enter':
        return '↵';
      case 'escape':
      case 'esc':
        return 'Esc';
      case 'arrowup':
        return '↑';
      case 'arrowdown':
        return '↓';
      case 'arrowleft':
        return '←';
      case 'arrowright':
        return '→';
      default:
        return key.toUpperCase();
    }
  }).join(' ');
}

// ============================================
// Available Shortcuts Reference
// ============================================

export const KEYBOARD_SHORTCUTS = {
  commandPalette: { keys: ['Ctrl', 'K'], description: 'Open command palette' },
  toggleTheme: { keys: ['Ctrl', 'Shift', 'L'], description: 'Toggle dark mode' },
  newTask: { keys: ['Ctrl', 'N'], description: 'Create new task' },
  search: { keys: ['Ctrl', 'K'], description: 'Focus search' },
  help: { keys: ['?'], description: 'Open help' },
  goToDashboard: { keys: ['G', 'D'], description: 'Go to Dashboard' },
  goToTasks: { keys: ['G', 'T'], description: 'Go to Tasks' },
  goToAnalytics: { keys: ['G', 'A'], description: 'Go to Analytics' },
  goToSettings: { keys: ['G', 'S'], description: 'Go to Settings' },
} as const;