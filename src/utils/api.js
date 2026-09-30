const API_URL = import.meta.env.VITE_API_URL;

// Where the public disk is mounted. A constant rather than a literal baked into
// every component that shows an image, so the storage layout is one edit.
const MEDIA_PREFIX = '/storage';

/* Images are NOT served under the API prefix. Laravel keeps them on the `public`
 * disk (storage/app/public, symlinked to public/storage) and serves them from the
 * site ROOT, so a record's `image_path` — "records/oamQx0K….jpg" — lives at
 * `<origin>/storage/records/oamQx0K….jpg`, while the API lives at `<origin>/api`.
 * Concatenating the two would produce a URL that 404s, and it would 404 silently.
 *
 * The origin is DERIVED from VITE_API_URL rather than declared in a second env
 * var: one source of truth, and the media host cannot drift away from the API
 * host. Derived defensively — this module must stay importable when the var is
 * missing, or a configuration error turns into a module-load crash instead of
 * the request error it actually is. */
const API_ORIGIN = (() => {
        if (!API_URL) return '';

        try {
                return new URL(API_URL).origin;
        } catch {
                return '';
        }
})();

/* Absolute URL for a stored image, or `null` when there is nothing to show: no
 * `image_path` from the API, or no origin to build against. `null` is the
 * caller's cue to fall back to a placeholder — a broken <img> is never the
 * answer. Trimmed because the API is documented to be loose with trailing
 * whitespace on its attributes, and a blank string is an absent image, not a
 * request for the site root; leading slashes are dropped so the join below can
 * never emit a `//`. */
export const mediaUrl = (imagePath) => {
        const path = typeof imagePath === 'string' ? imagePath.trim().replace(/^\/+/, '') : '';

        if (!path || !API_ORIGIN) return null;

        return `${API_ORIGIN}${MEDIA_PREFIX}/${path}`;
};

// endpoints map
export const ENDPOINTS = {
    public: {
        bloomingMeadow: '/blooming-meadow',
        login: '/login',
        register: '/register',
    },
    private: {
        logout: '/logout',
        records: '/records',
        dashboardStats: '/dashboard/stats',
    },
};
// base fetch
export const fetchData = async (endpoint, options = {}) => { //options as default empty

        if (!API_URL) {

            throw new Error('VITE_API_URL not set in .env');
        }

        // extract params if present
        const { params, ...fetchOptions } = options;
        // base fethc url
        let url = `${API_URL}${endpoint}`;

        // if params,convert into querystring
        if (params && Object.keys(params).length > 0) {
            // using native JS object for building urls (!!!!!!! to cool for school!!!!)
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }

        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...fetchOptions.headers,
            },
        });


        if (!response.ok) {

            throw new Error(`HTTP Error: ${response.status}`)
        }

        return await response.json();



}

