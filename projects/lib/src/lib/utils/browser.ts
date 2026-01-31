/**
 * SSR-safe browser utilities.
 * These utilities provide safe access to browser-specific features
 * that don't exist in server-side or edge runtime environments.
 */

/**
 * Check if running in a browser environment.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Safe access to window object.
 * Returns undefined in non-browser environments.
 */
export function getWindow(): Window | undefined {
  return isBrowser() ? window : undefined;
}

/**
 * Safe access to document object.
 * Returns undefined in non-browser environments.
 */
export function getDocument(): Document | undefined {
  return isBrowser() ? document : undefined;
}

/**
 * Check if running in a server-side rendering context.
 */
export function isSSR(): boolean {
  return !isBrowser();
}

/**
 * Creates an HTML element safely.
 * Returns null in non-browser environments.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K
): HTMLElementTagNameMap[K] | null {
  const doc = getDocument();
  return doc ? doc.createElement(tagName) : null;
}

/**
 * Safe requestAnimationFrame wrapper.
 * Returns 0 in non-browser environments.
 */
export function safeRequestAnimationFrame(callback: FrameRequestCallback): number {
  const win = getWindow();
  return win ? win.requestAnimationFrame(callback) : 0;
}

/**
 * Safe cancelAnimationFrame wrapper.
 * No-op in non-browser environments.
 */
export function safeCancelAnimationFrame(handle: number): void {
  const win = getWindow();
  if (win) {
    win.cancelAnimationFrame(handle);
  }
}
