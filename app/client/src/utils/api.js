/* Author: Jonathan Lamontagne Kratz */

/**
 * A wrapper for the fetching to 'include' the cookies.
 */
export async function fetchWithAuth(url, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    return fetch(url, defaultOptions);
}
