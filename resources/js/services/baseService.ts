import axios from 'axios';

export class BaseService {
    protected baseURL: string;

    constructor(endpoint: string) {
        this.baseURL = `/api/${endpoint}`;
    }

    protected async get(path: string = '') {
        try {
            const response = await axios.get(`${this.baseURL}${path}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async post(path: string = '', data = {}) {
        try {
            const response = await axios.post(`${this.baseURL}${path}`, data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async put(path: string = '', data = {}) {
        try {
            const response = await axios.put(`${this.baseURL}${path}`, data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    protected async delete(path: string = '') {
        try {
            const response = await axios.delete(`${this.baseURL}${path}`);
            return response.data;
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
