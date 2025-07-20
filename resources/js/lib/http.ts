import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

class HttpClient {
    private axiosInstance: AxiosInstance;
    private static instance: HttpClient;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: '/api',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
        this.setupCSRFToken();
    }

    public static getInstance(): HttpClient {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient();
        }
        return HttpClient.instance;
    }

    private setupCSRFToken() {
        // Set CSRF token for Laravel
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            this.axiosInstance.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
        }
    }

    private setupInterceptors() {
        // Request interceptor - Add auth token to every request
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - Handle token expiration
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    this.removeToken();
                    // Redirect to login page
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // Token management methods
    public setToken(token: string): void {
        localStorage.setItem('api-token', token);
        // Also set it immediately on the axios instance
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    public getToken(): string | null {
        return localStorage.getItem('api-token');
    }

    public removeToken(): void {
        localStorage.removeItem('api-token');
        // Remove from axios instance
        delete this.axiosInstance.defaults.headers.common['Authorization'];
    }

    public isAuthenticated(): boolean {
        return !!this.getToken();
    }

    // HTTP methods
    public async get(url: string, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.get(url, config);
        return response.data;
    }

    public async post(url: string, data?: any, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.post(url, data, config);
        return response.data;
    }

    public async put(url: string, data?: any, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.put(url, data, config);
        return response.data;
    }

    public async patch(url: string, data?: any, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.patch(url, data, config);
        return response.data;
    }

    public async delete(url: string, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.delete(url, config);
        return response.data;
    }

    // Get the raw axios instance if needed
    public getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}

// Export singleton instance
export const httpClient = HttpClient.getInstance();

// Also export the class for type checking
export { HttpClient };