const API_URL = import.meta.env.VITE_API_URL;

const MEDIA_PREFIX = '/storage';

const API_ORIGIN = (() => {
        if (!API_URL) return '';

        try {
                return new URL(API_URL).origin;
        } catch {
                return '';
        }
})();

/* Absolute URL for a stored image, or `null` when there is nothing to show: if no image, fallback to placeholder */
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
                prism: '/prism',
        },
};
/* /* ------------------------------------------------------------------ *
 * TOKENS STORAGE
 * ------------------------------------------------------------------ */

const TOKEN_KEY = 'auth_token';

export const setStoredToken = (token) => {
        if (!token) {
                localStorage.removeItem(TOKEN_KEY);
                return;
        }

        localStorage.setItem(TOKEN_KEY, token);
};

export const getStoredToken = () => {
        const raw = localStorage.getItem(TOKEN_KEY);

        if (!raw) return null;

        const token = raw.trim();

        if (!token || token === 'undefined' || token === 'null') return null;

        return token;
};

export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

/* ------------------------------------------------------------------ *
 * RESPONSE
 * ------------------------------------------------------------------ */

// HEADER NORMALIZATION

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

// UNWRAP ENVELOPE : avoid multiple levels.
// response.data.value => data.value

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

// `anonymous: true` === GUEST
// 401 === wrong credentials

export const fetchData = async (endpoint, options = {}) => { // options as default empty

        if (!API_URL && !/^https?:\/\//i.test(String(endpoint))) { //   i => CASE INSENSITIVE

                throw new Error('VITE_API_URL not set in .env');
        }

        // extract params and auth:anonymous
        const { params, anonymous, ...fetchOptions } = options;

        const token = anonymous ? null : getStoredToken();


        let url = /^https?:\/\//i.test(String(endpoint))
                ? String(endpoint)
                : `${API_URL.replace(/\/+$/, '')}/${String(endpoint).replace(/^\/+/, '')}`;

        // Validate that 'params' is a non-null object
        if (params && typeof params === 'object') {
                const query = new URLSearchParams();

                // Iterate through key-value pairs in params and append to headings
                for (const [key, raw] of Object.entries(params)) {
                        // Normalize single values into an array for coherence
                        const values = Array.isArray(raw) ? raw : [raw];
                        
                        // Ensure array keys have '[]' suffix for multi-value params (Laravel requirement)
                        const name = Array.isArray(raw) && !key.endsWith('[]') ? `${key}[]` : key;

                        for (const value of values) {
                                // Skip empty, null, or undefined values
                                if (value === undefined || value === null || value === '') continue;

                                // Append key-value pair to query parameters
                                query.append(name, value);
                                }
                        }

                const queryString = query.toString();

                // ADD QUERY STRING TO URL
                if (queryString)  {
                        url += `?${queryString}`; 
                        
                }
        }

        const headers = {
                ...normalizeHeaders(fetchOptions.headers),
                'Accept': 'application/json',
        };

        
        // Check if a request body is present (neither undefined nor null)
        const hasBody = fetchOptions.body !== undefined && fetchOptions.body !== null;

        // Set default Content-Type if a body exists and header isn't already defined (case-insensitive check)
        if (hasBody && !Object.keys(headers).some(key => key.toLowerCase() === 'content-type')) {
                // Don't set JSON content-type for FormData; browser must set boundary
                if (!(fetchOptions.body instanceof FormData)) {
                        headers['Content-Type'] = 'application/json';
                }
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

