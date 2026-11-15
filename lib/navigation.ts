// Remembers the applications list URL (with its filters) for this browser tab, so "Back" on
// an application returns to the list as the user left it. sessionStorage can be unavailable
// (private mode, blocked storage), so failures fall back to the plain list.

const KEY = 'maj:applications-url';
const DEFAULT_URL = '/applications';

export function rememberApplicationsUrl(url: string) {
    try {
        sessionStorage.setItem(KEY, url);
    } catch {
        // Storage unavailable; "Back" will use the plain list.
    }
}

export function lastApplicationsUrl(): string {
    try {
        return sessionStorage.getItem(KEY) ?? DEFAULT_URL;
    } catch {
        return DEFAULT_URL;
    }
}
