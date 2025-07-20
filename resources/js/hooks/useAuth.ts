import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { TokenSync } from '@/utils/tokenSync';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    is_admin: boolean;
}

interface UseAuthReturn {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, deviceName?: string) => Promise<void>;
    register: (name: string, email: string, password: string, passwordConfirmation: string, deviceName?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    ensureApiToken: () => Promise<boolean>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = authService.isAuthenticated();

    // Load user on mount if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            loadUser();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const loadUser = async () => {
        try {
            setIsLoading(true);
            const userData = await authService.getUser();
            setUser(userData);
        } catch (error) {
            console.error('Failed to load user:', error);
            // If token is invalid, remove it
            authService.removeToken();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string, deviceName?: string) => {
        try {
            setIsLoading(true);
            const response = await authService.login({
                email,
                password,
                device_name: deviceName
            });
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (
        name: string, 
        email: string, 
        password: string, 
        passwordConfirmation: string, 
        deviceName?: string
    ) => {
        try {
            setIsLoading(true);
            const response = await authService.register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                device_name: deviceName
            });
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await authService.logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails, clear local state
            setUser(null);
            authService.removeToken();
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        await loadUser();
    };

    const ensureApiToken = async (): Promise<boolean> => {
        return await TokenSync.ensureApiToken();
    };

    return {
        user,
        isAuthenticated: isAuthenticated && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        ensureApiToken
    };
}