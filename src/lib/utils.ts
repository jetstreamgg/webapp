import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LinkedAction } from '@/modules/ui/hooks/useUserSuggestedActions';
import { ALLOWED_EXTERNAL_DOMAINS } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFooterLinks(): { url: string; name: string }[] {
  let footerLinks: { url: string; name: string }[] = [
    { url: '', name: '' },
    { url: '', name: '' },
    { url: '', name: '' }
  ];
  try {
    const footerLinksVar = import.meta.env.VITE_FOOTER_LINKS;
    if (footerLinksVar) footerLinks = JSON.parse(footerLinksVar);
  } catch (error) {
    console.error('Error parsing FOOTER_LINKS:', error);
  }
  return footerLinks;
}

export function filterActionsByIntent(actions: LinkedAction[], intent: string) {
  return actions.filter(x => x.intent === intent || (x as LinkedAction)?.la === intent);
}

/**
 * Sanitizes a URL to ensure it begins with 'https:'.
 * Some URLs are directly provided via environment variables.
 */
export function sanitizeUrl(url: string | undefined) {
  if (!url) return undefined;
  try {
    const parsedUrl = new URL(url);
    // Ensure that the url begins with 'https:'
    if (parsedUrl.protocol !== 'https:') {
      return undefined;
    }

    // Check if the domain is in the allowed list. Check for subdomains too
    if (
      !ALLOWED_EXTERNAL_DOMAINS.some(
        domain => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
      )
    ) {
      return undefined;
    }

    // Remove any potential dangerous characters from the URL
    const sanitizedUrl = parsedUrl.toString().replace(/[^\w:/.?#&=-]/g, '');

    // Encode components to prevent XSS
    const encodedUrl = encodeURI(sanitizedUrl);

    // Validate the final URL
    new URL(encodedUrl); // This will throw if the URL is invalid

    return encodedUrl;
  } catch (error) {
    console.error('Error parsing url');
    return undefined;
  }
}
