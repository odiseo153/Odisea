import { httpClient } from '@/lib/http';

export class BaseService {
    protected endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    protected async get(path: string = '') {
        try {
            return await httpClient.get(`/${this.endpoint}${path}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async post(path: string = '', data = {}) {
        try {
            return await httpClient.post(`/${this.endpoint}${path}`, data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async put(path: string = '', data = {}) {
        try {
            return await httpClient.put(`/${this.endpoint}${path}`, data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async patch(path: string = '', data = {}) {
        try {
            return await httpClient.patch(`/${this.endpoint}${path}`, data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async delete(path: string = '') {
        try {
            return await httpClient.delete(`/${this.endpoint}${path}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected handleError(error): Error {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return new Error(error.response.data.message || 'An error occurred');
        } else if (error.request) {
            // The request was made but no response was received
            return new Error('No response received from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            return new Error('Error setting up the request');
        }
    }
}
