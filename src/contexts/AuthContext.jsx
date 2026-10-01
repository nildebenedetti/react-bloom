import { createContext, useContext, useState, useEffect } from "react";
import { ENDPOINTS, fetchData } from "../utils/api.js";

const AuthContext = createContext(null);

function AuthProvider( { children } ) {
    const [ user, setUser ] = useState(null);
    const [ token, setToken ] = useState( () => localStorage.getItem('auth_token') );
    const [ isLoading, setIsLoading ] = useState(true);

    // execute anytime the token changes
    useEffect( () => {
    
        async function verifySession() {

            if (token) {

                try {
                    // fetch user endpoint sending current token as header
                    const userData = await fetchData(ENDPOINTS.private.user); // the token is fetched inside fetchData
                    setUser(userData);
                } catch (error) {
                    console.error('invalid session:', error );
                    setToken(null);
                    setUser(null);
                    localStorage.removeItem('auth_token'); // clean
                } 

            }

            setIsLoading(false);

        }

        verifySession();

        // if unauth
        const handleUnauthorized = () => {
            setToken(null);
            setUser(null);
        };

        window.addEventListener("auth:unauthorized", handleUnauthorized);

        // cleanup
        return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);


    }, [ token ]);


    // REGISTER

    const register = async (formData) => {
        // call API
        const data = await fetchData(ENDPOINTS.public.register, {
            method: "POST",
            body: JSON.stringify(formData),
        });
        // API sends back token 1!
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
    }

    // LOGIN
    const login = async (email, password) => {
        // post data to api endpoint
        const data = await fetchData(ENDPOINTS.public.login, {
            method: "POST",
            body: JSON.stringify({ email, password}),
        });

        // when server sends me back a response with token 2 (for all session after first): time to. override
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);

    };

    // LOGOUT

    const logout = async () => {
        try {
            await fetchData(ENDPOINTS.private.logout, {
                method: "POST"
            });
        } catch (error) {
            console.warn('failed to revoke token');
        } finally {
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
        }
    };

    return (<AuthContext.Provider value={{ 
                            user, 
                            token, 
                            isLoading, 
                            register,
                            login, 
                            logout}}>
        {children}
    </AuthContext.Provider>)



}

function useAuthContext() {
    return useContext(AuthContext);
};

export {
    AuthContext,
    AuthProvider,
    useAuthContext
};
