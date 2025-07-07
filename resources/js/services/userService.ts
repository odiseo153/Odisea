import { BaseService } from './baseService';
import { User } from '@/types';

export class UserService extends BaseService {
    constructor() {
        super('users');
    }

    async getCurrentUser() {
        return this.get('/current');
    }

    async getUserById(id: string) {
        return this.get(`/${id}`);
    }

    async updateProfile(id: string, userData: User) {
        return this.put(`/${id}`, userData);
    }

    async updatePassword(id: string, passwordData:string) {
        return this.put(`/${id}/password`, passwordData);
    }

    async getUserPlaylists(id: string) {
        return this.get(`/${id}/playlists`);
    }

    async getUserFavorites(id: string) {
        return this.get(`/${id}/favorites`);
    }
}

export const userService = new UserService();
