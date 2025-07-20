import { httpClient } from '@/lib/http';

interface LoginCredentials {
    email: string;
    password: string;
    device_name?: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    device_name?: string;
}

interface AuthResponse {
    user: any;
    token: string;
    message: string;
}

export class AuthService  {
    constructor() {
        // Initialize token if it exists in localStorage
        this.initializeToken();
    }

    private initializeToken() {
        const token = httpClient.getToken();
        if (token) {
            httpClient.setToken(token);
        }
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const data = await httpClient.post('/login', {
                ...credentials,
                device_name: credentials.device_name || 'web-app'
            });

            const { token, user } = data;
            this.setToken(token);
            
            return data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async register(userData: RegisterData): Promise<AuthResponse> {
        try {
            const data = await httpClient.post('/register', {
                ...userData,
                device_name: userData.device_name || 'web-app'
            });

            const { token, user } = data;
            this.setToken(token);
            
            return data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async logout(): Promise<void> {
        try {
            console.log(httpClient.getToken());
            await httpClient.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.removeToken();
        }
    }

    async logoutAll(): Promise<void> {
        try {
            await httpClient.post('/logout-all');
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            this.removeToken();
        }
    }

    async getUser(): Promise<any> {
        try {
            const data = await httpClient.get('/user');
            return data.user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Token management - delegate to httpClient
    setToken(token: string): void {
        httpClient.setToken(token);
    }

    getToken(): string | null {
        return httpClient.getToken();
    }

    removeToken(): void {
        httpClient.removeToken();
    }

    isAuthenticated(): boolean {
        return httpClient.isAuthenticated();
    }

    private handleError(error: any): Error {
        if (error.response) {
            const message = error.response.data.message || 
                           error.response.data.errors || 
                           'An error occurred';
            return new Error(typeof message === 'object' ? JSON.stringify(message) : message);
        } else if (error.request) {
            return new Error('No response received from server');
        } else {
            return new Error('Error setting up the request');
        }
    }
}

export const authService = new AuthService();