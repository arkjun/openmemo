import { afterEach, beforeEach, vi } from 'vitest';

// Reset modules and mocks between tests
beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
});
