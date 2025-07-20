import { BaseService } from './baseService';
import { Playlist } from '@/types';

export class PlaylistService extends BaseService {
    constructor() {
        super('playlists');
    }

    async getAllPlaylists() {
        return this.get();
    }

    async getPlaylistById(id: string) {
        return this.get(`/${id}`);
    }

    async createPlaylist(playlistData: Playlist | FormData) {
        return this.post('', playlistData);
    }

    async updatePlaylist(id: string, playlistData: Playlist | FormData) {
        return this.put(`/${id}`, playlistData);
    }

    async deletePlaylist(id: string) {
        return this.delete(`/${id}`);
    }

    async addSongToPlaylist(playlistId: string, songId: string) {
        return this.post(`/${playlistId}/songs/${songId}`, { song_id: songId });
    }

    async removeSongFromPlaylist(playlistId: string, songId: string) {
        return this.delete(`/${playlistId}/songs/${songId}`);
    }

    async togglePublicStatus(playlistId: string, isPublic: boolean) {
        return this.put(`/${playlistId}`, { is_public: isPublic });
    }

    async toggleFavorite(playlistId: string) {
        return this.post(`/${playlistId}/favorite`);
    }

    async checkFavorite(playlistId: string) {
        return this.get(`/${playlistId}/favorite`);
    }

    async getUserFavorites() {
        return this.get('/favorites/user');
    }
}

export const playlistService = new PlaylistService();
