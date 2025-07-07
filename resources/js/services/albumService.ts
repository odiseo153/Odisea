import { BaseService } from './baseService';

export class AlbumService extends BaseService {
    constructor() {
        super('albums');
    }

    async getAllAlbums() {
        return this.get();
    }

    async getAlbumById(id: string) {
        return this.get(`/${id}`);
    }

    async searchAlbums(query: string) {
        return this.get(`/search?search=${query}`);
    }

    async getAlbumTracks(id: string) {
        return this.get(`/${id}/tracks`);
    }

    async getAlbumsByArtist(artistId: string) {
        return this.get(`/artist/${artistId}`);
    }

    async createAlbum(data: any) {
        if (data instanceof FormData) {
            return this.post('',  {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
             body:data
            });
        }
        return this.post('', data);
    }

    async updateAlbum(id: string, data: any) {
        if (data instanceof FormData) {
            return this.put(`/${id}`,{
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: data,
            });
        }
        return this.put(`/${id}`, data);
    }

    async deleteAlbum(id: string) {
        return this.delete(`/${id}`);
    }

    async addSongToAlbum(albumId: string, songId: string) {
        return this.post(`/${albumId}/songs`, { song_id: songId });
    }

    async removeSongFromAlbum(albumId: string, songId: string) {
        return this.delete(`/${albumId}/songs/${songId}`);
    }
}

export const albumService = new AlbumService();
