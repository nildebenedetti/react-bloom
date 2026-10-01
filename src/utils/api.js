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
                user: '/user', // automatically set by laravel when sanctum is installed -> send token, get user data
                logout: '/logout',
                records: '/records',
                dashboardStats: '/dashboard/stats',
        },
};
/* ------------------------------------------------------------------ *
 * token storage
 * ------------------------------------------------------------------ */

const TOKEN_KEY = 'auth_token';

/* The one place that knows how a token is read out of the browser. It exists
 * because `localStorage.setItem` accepts anything and stringifies it: a login
 * response read at the wrong nesting level stores the literal text "undefined",
 * which then travels back to the API as `Authorization: Bearer undefined` and
 * comes back a 401 — a session that can never be repaired without clearing
 * storage by hand. Reading the token through this helper makes that value read
 * as "no token" instead.
 *
 * Only obviously-broken values are rejected; the shape of a Sanctum token is
 * deliberately NOT validated here, because the server is the only authority on
 * whether a token is still alive. */
export const getStoredToken = () => {
        const raw = localStorage.getItem(TOKEN_KEY);

        if (!raw) return null;

        const token = raw.trim();

        if (!token || token === 'undefined' || token === 'null') return null;

        return token;
};

/* Writing and clearing go through one door too, so a missing token removes the
 * stored one rather than persisting a new broken value. */
export const setStoredToken = (token) => {
        if (!token) {
                localStorage.removeItem(TOKEN_KEY);
                return;
        }

        localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

/* ------------------------------------------------------------------ *
 * response shapes
 * ------------------------------------------------------------------ */

/* `fetch` accepts a plain object, a `Headers` instance or an array of pairs, but
 * object spread only understands the first one. Spreading a `Headers` yields
 * nothing, which would silently drop the caller's headers. */
const normalizeHeaders = (input) => {
        if (!input) return {};

        if (typeof Headers !== 'undefined' && input instanceof Headers) {
                return Object.fromEntries(input.entries());
        }

        if (Array.isArray(input)) {
                return Object.fromEntries(input);
        }

        return input;
};

/* Most single-object responses arrive inside an envelope:
 *
 *   { "status": "Request was successful", "message": "", "data": { … } }
 *
 * …so `data.token` is really `response.data.token`, and returning the envelope
 * unchanged is how a login ends up storing "undefined" as its token.
 *
 * IF envelope, wqe need to unwrap it */
const unwrapEnvelope = (payload) => {
        if (
                payload &&
                typeof payload === 'object' &&
                !Array.isArray(payload) &&
                typeof payload.status === 'string' &&
                'data' in payload
        ) {
                return payload.data;
        }

        return payload;
};

/* ------------------------------------------------------------------ *
 * base fetch
 * ------------------------------------------------------------------ */

/* `anonymous: true` marks a request as one that must not take part in session
 * bookkeeping: login and register, which are the two endpoints whose 401 means
 * "those credentials are wrong" rather than "your session died".
 *
 * It is declared per call instead of inferred from the URL, because the
 * inference does not hold: the public *feed* (`GET /blooming-meadow`) answers
 * 401 to nobody, while `POST /login` answers 401 to everybody who mistypes a
 * password — including users who are already signed in and merely re-logging.
 * Reading the URL would sign those users out over a typo. It also stops the
 * header from being attached at all, so a re-login cannot be influenced by the
 * token it is trying to replace. */
export const fetchData = async (endpoint, options = {}) => { //options as default empty

        if (!API_URL && !/^https?:\/\//i.test(String(endpoint))) {

                throw new Error('VITE_API_URL not set in .env');
        }

        // extract params if present, plus the session bookkeeping flag
        const { params, anonymous, ...fetchOptions } = options;

        // get token from browser, unless this request opts out of auth
        const token = anonymous ? null : getStoredToken();

        /* Join base and endpoint so a trailing slash on VITE_API_URL (common
         * when copied out of .env.example) and a leading slash on ENDPOINTS
         * cannot produce a `//api//user` the server 404s. An endpoint that is
         * already absolute is left alone, so passing a full URL is not a trap. */
        let url = /^https?:\/\//i.test(String(endpoint))
                ? String(endpoint)
                : `${API_URL.replace(/\/+$/, '')}/${String(endpoint).replace(/^\/+/, '')}`;

        // Validate that 'params' is a non-null object
        if (params && typeof params === 'object') {
                const query = new URLSearchParams();

                // Iterate through key-value pairs in params
                for (const [key, raw] of Object.entries(params)) {
                        // Normalize single values into an array for uniform processing
                        const values = Array.isArray(raw) ? raw : [raw];
                        
                        // Ensure array keys have '[]' suffix for multi-value params (e.g., PHP/Laravel style)
                        const name = Array.isArray(raw) && !key.endsWith('[]') ? `${key}[]` : key;

                        for (const value of values) {
                                // Skip empty, null, or undefined values
                                if (value === undefined || value === null || value === '') continue;

                                // Append key-value pair to query parameters
                                query.append(name, value);
                                }
                        }

                const queryString = query.toString();

                if (queryString) url += `?${queryString}`;
        }

        const headers = {
                ...normalizeHeaders(fetchOptions.headers),
                'Accept': 'application/json',
        };

        
        // Check if a request body is present (neither undefined nor null)
        const hasBody = fetchOptions.body !== undefined && fetchOptions.body !== null;

        // Set default Content-Type if a body exists and header isn't already defined (case-insensitive check)
        if (hasBody && !Object.keys(headers).some(key => key.toLowerCase() === 'content-type')) {
                // Fallback to application/json format
        headers['Content-Type'] = 'application/json';
}

        // if token, we need to add a section with auth token
        if (token) {
            // creare auth key, and init value
                headers['Authorization'] = `Bearer ${token}`;
        }

        // defaults to GET when only a body is given without specified method
        const method = (fetchOptions.method ?? (hasBody ? 'POST' : 'GET')).toUpperCase();

        const response = await fetch(url, {
                ...fetchOptions,
                method,
                headers,
        });
        
        if (response.status === 401 && token && !anonymous) {
            clearStoredToken(); // need a cleanup
            window.dispatchEvent(new Event('auth:unauthorized')); // launching an event (we need to listen and set consequences)
        }

        const data = await response.json().catch(() => null); // in case of error, return null and prevent app crash <3


        if (!response.ok) {

                const errorMessage = data?.message || `HTTP Error: ${response.status}`; // checks in first place if data is present, otherwise response.status
        
                const error = new Error(errorMessage);

                error.status = response.status;
                error.data = data; // laravel error details - if !error = null
                
                throw error;

        }

        // the envelope is unwrapped last, so errors keep the whole body
        return unwrapEnvelope(data);

}

