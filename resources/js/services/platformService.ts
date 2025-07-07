import { BaseService } from './baseService';
import { Platform } from '@/types';

export class PlatformService extends BaseService {
    constructor() {
        super('platforms');
    }

    async getAllPlatforms() {
        return this.get();
    }

    async getPlatformById(id: string) {
        return this.get(`/${id}`);
    }

    async createPlatform(platformData: Platform) {
        return this.post('', platformData);
    }

    async updatePlatform(id: string, platformData: Platform) {
        return this.put(`/${id}`, platformData);
    }

    async deletePlatform(id: string) {
        return this.delete(`/${id}`);
    }
}

export const platformService = new PlatformService();
