import { BaseService } from './baseService';

export class ArtistService extends BaseService {
    constructor() {
        super('artists');
    }

    async getAllArtists() {
        return this.get();
    }

    async getArtistById(id: string) {
        return this.get(`/${id}`);
    }

    async searchArtists(query: string) {
        return this.get(`/search?search=${query}`);
    }

    async getArtistAlbums(id: string) {
        return this.get(`/${id}/albums`);
    }

    async getArtistTopTracks(id: string) {
        return this.get(`/${id}/top-tracks`);
    }

    async getRelatedArtists(id: string) {
        return this.get(`/${id}/related`);
    }
}

export const artistService = new ArtistService();
