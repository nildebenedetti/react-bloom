import { createContext, useContext, useState, useEffect } from "react";
import { ENDPOINTS, fetchData, getStoredToken, setStoredToken, clearStoredToken } from "../utils/api.js";

const AuthContext = createContext(null);

function AuthProvider( { children } ) {
    const [ user, setUser ] = useState(null);
    // read through the api helper: a stored "undefined" is no token, not a session
    const [ token, setToken ] = useState( () => getStoredToken() );
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
                    clearStoredToken(); // clean
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
        // call API (anonymous: a rejected registration must not clear an existing session)
        const data = await fetchData(ENDPOINTS.public.register, {
            method: "POST",
            body: JSON.stringify(formData),
            anonymous: true,
        });
        // API sends back token 1! (fetchData already unwrapped the { data } envelope)
        setStoredToken(data.token);
        setToken(data.token);
        setUser(data.user);
    }

    // LOGIN
    const login = async (email, password) => {
        // post data to api endpoint (anonymous: a wrong password is a failed attempt,
        // not an expired session, so it must not sign the user out)
        const data = await fetchData(ENDPOINTS.public.login, {
            method: "POST",
            body: JSON.stringify({ email, password}),
            anonymous: true,
        });

        // when server sends me back a response with token 2 (for all session after first): time to. override
        setStoredToken(data.token);
        setToken(data.token);
        setUser(data.user);

    };

    // LOGOUT

    const logout = async () => {
        try {
            await fetchData(ENDPOINTS.private.logout, {
                method: "POST"
            });
        } catch {
            // the token is dropped either way: a logout that cannot reach the
            // server must still sign the user out locally
            console.warn('failed to revoke token');
        } finally {
            clearStoredToken();
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
