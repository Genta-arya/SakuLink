/**
 * Validates if the given string is a valid URL with http or https protocol.
 * @param {string} urlString 
 * @returns {boolean}
 */
export function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes URL for consistent storage and duplicate detection.
 * Removes trailing slash, converts hostname to lowercase, sorts search params.
 * @param {string} urlString 
 * @returns {string}
 */
export function normalizeUrl(urlString) {
  try {
    const url = new URL(urlString);
    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    
    const params = new URLSearchParams(url.search);
    params.sort();
    const search = params.toString() ? `?${params.toString()}` : '';

    return `${url.protocol}//${url.hostname.toLowerCase()}${url.port ? `:${url.port}` : ''}${pathname}${search}`;
  } catch {
    return urlString;
  }
}

/**
 * Extracts domain name safely from a URL.
 * @param {string} urlString 
 * @returns {string}
 */
export function getDomain(urlString) {
  try {
    const url = new URL(urlString);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Gets a reliable fallback favicon URL using Google's favicon service.
 * @param {string} urlString 
 * @returns {string}
 */
export function getFaviconUrl(urlString) {
  try {
    const domain = getDomain(urlString);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
}
