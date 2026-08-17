import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/ui-store';

describe('UI Store (Zustand)', () => {
  beforeEach(() => {
    useUIStore.setState({
      isSidebarCollapsed: false,
      isMobileNavOpen: false,
      activeModalId: null,
    });
  });

  it('toggles sidebar collapse state', () => {
    expect(useUIStore.getState().isSidebarCollapsed).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarCollapsed).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarCollapsed).toBe(false);
  });

  it('manages modal open/close state', () => {
    expect(useUIStore.getState().activeModalId).toBeNull();
    useUIStore.getState().openModal('report-modal');
    expect(useUIStore.getState().activeModalId).toBe('report-modal');
    useUIStore.getState().closeModal();
    expect(useUIStore.getState().activeModalId).toBeNull();
  });
});
