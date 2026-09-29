const API_URL = import.meta.env.VITE_API_URL;

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

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
        });


        if (!response.ok) {

            throw new Error(`HTTP Error: ${response.status}`)
        }

        return await response.json();



}

