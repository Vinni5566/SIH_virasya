/**
 * @fileOverview Utility to synchronize and trigger page-wide DOM translation across all components.
 */

export const LANGUAGE_MAP: Record<string, { code: string; name: string; nativeName: string }> = {
  Hindi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  Tamil: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  Bengali: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  Marathi: { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  Gujarati: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  Telugu: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  Kannada: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  Malayalam: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  Punjabi: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  English: { code: 'en', name: 'English', nativeName: 'English' },
};

/**
 * Triggers Google Translate for the entire document DOM and sets persistence cookies.
 */
export function switchPageLanguage(targetLang: string) {
  if (typeof window === 'undefined') return;

  const langCode = LANGUAGE_MAP[targetLang]?.code || targetLang.toLowerCase();

  try {
    const hostname = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    document.cookie = `googtrans=/en/${langCode}; domain=${hostname}; path=/;`;
    document.cookie = `googtrans=/auto/${langCode}; path=/;`;
    document.cookie = `googtrans=/auto/${langCode}; domain=${hostname}; path=/;`;
  } catch (e) {
    console.warn('Could not set translation cookies', e);
  }

  const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (selectElement) {
    selectElement.value = langCode;
    selectElement.dispatchEvent(new Event('change'));
  }
}
