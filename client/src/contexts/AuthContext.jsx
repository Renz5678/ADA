import { createContext, useContext, useState, useEffect } from 'react';
import api from '#api/axiosInstance.js';
import clientApi from '#api/clientApi.js';
import LoadingBar from '#components/ui/LoadingBar.jsx';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [client, setClient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshAuth = async () => {
        const [userRes, clientRes] = await Promise.allSettled([
            api.get('/auth/me'),
            clientApi.get('/client-auth/me')
        ]);
        
        if (userRes.status === 'fulfilled') setUser(userRes.value.data.user);
        else setUser(null);
        
        if (clientRes.status === 'fulfilled') setClient(clientRes.value.data.client);
        else setClient(null);
    };

    useEffect(() => {
        refreshAuth().finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <LoadingBar isLoading={true} message="Initializing..." />;
    }

    return (
        <AuthContext.Provider value={{ user, setUser, client, setClient, refreshAuth, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}
