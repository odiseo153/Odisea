import { httpClient } from '@/lib/http';

/**
 * Utility to sync tokens between web authentication and API authentication
 * This helps when users login via the web form but need API access
 */
export class TokenSync {
    /**
     * Create an API token for the current web-authenticated user
     * This is useful when a user logs in via web but needs API access
     */
    static async createApiToken(deviceName: string = 'web-session'): Promise<string | null> {
        try {
            // Make a request to create a new token for the current user
            const response = await fetch('/api/create-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include', // Include session cookies
                body: JSON.stringify({ device_name: deviceName })
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.token;

                // Store the token in our HTTP client
                httpClient.setToken(token);

                return token;
            }
        } catch (error) {
            console.error('Failed to create API token:', error);
        }

        return null;
    }

    /**
     * Check if we have a valid API token, if not try to create one
     * This ensures seamless transition from web auth to API auth
     */
    static async ensureApiToken(): Promise<boolean> {
        // If we already have a token, check if it's valid
        if (httpClient.isAuthenticated()) {
            try {
                await httpClient.get('/user');
                return true; // Token is valid
            } catch (error) {
                // Token is invalid, remove it
                httpClient.removeToken();
            }
        }

        // Try to create a new token from web session
        const token = await this.createApiToken();
        return !!token;
    }

    /**
     * Sync logout between web and API
     */
    static async syncLogout(): Promise<void> {
        // Remove API token
        httpClient.removeToken();

        // Also logout from web session
        try {
            await fetch('/logout', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include'
            });
        } catch (error) {
            console.error('Web logout failed:', error);
        }
    }
}