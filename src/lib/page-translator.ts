/**
 * Client-side utility for full-page UI translation via Google Translate widget.
 * Synchronizes DOM text node translation across the entire page.
 *
 * IMPORTANT: We set ONLY the path-based googtrans cookie (no domain= attribute).
 * If we set both a path-based AND a domain-specific cookie, Google Translate's
 * internal "Show original" restore function only clears one of them, meaning the
 * page stays translated after the user clicks "Show original". This is the root
 * cause of the "Show original" button not working.
 */
// Guard against Google Translate DOM manipulation causing React removeChild / insertBefore crashes
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
  };
}

export function triggerFullPageTranslation(langCode: string) {
  if (typeof window === 'undefined') return;

  if (langCode === 'en') {
    // Explicitly clear both cookie variants so "Show original" and our own
    // language switcher revert can fully restore the page to English.
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;

    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = 'en';
      selectElement.dispatchEvent(new Event('change'));
    }
    return;
  }

  // Set ONLY path-based cookie — no domain= attribute.
  // Google Translate's "Show original" button knows how to clear exactly this
  // format, making the restore flow work end-to-end.
  document.cookie = `googtrans=/en/${langCode}; path=/`;

  // Dispatch change event to the Google Translate element combo box
  const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (selectElement) {
    selectElement.value = langCode;
    selectElement.dispatchEvent(new Event('change'));
  } else {
    // Widget still mounting — poll until combo is in DOM
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
        clearInterval(interval);
      } else if (attempts > 15) {
        clearInterval(interval);
      }
    }, 150);
  }
}
