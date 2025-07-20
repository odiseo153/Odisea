import { BaseService } from './baseService';
import axios from 'axios';

export class SongService extends BaseService {
    constructor() {
        super('songs');
    }

    async getAllSongs() {
        return this.get();
    }

    async getSongById(id: string) {
        return this.get(`/${id}`);
    }

    async searchSongs(query: string) {
        return this.get(`/search?search=${query}`);
    }

    async createSong(userId: string, songData: any) {
        return this.post(`/${userId}`, songData);
    }

    async updateSong(id: string, songData: any) {
        return this.put(`/${id}`, songData);
    }

    async deleteSong(id: string) {
        return this.delete(`/${id}`);
    }

    async toggleFavorite(songId: string) {
        return this.post(`/${songId}/favorite`);
    }

    async addInteraciont(songId: string, userId: string) {
         await axios.post(`api/interactions`, {
            model_type: 'song',
            model_id: songId,
            user_id: userId
        });
    }
}

export const songService = new SongService();
