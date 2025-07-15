interface AudioInfo {
    id: string;
    title: string;
    artist: string;
    duration: number;
    cover_url: string;
    stream_url: string;
    file_size: number;
    mime_type: string;
    supports_seeking: boolean;
}

interface AudioDownloadInfo {
    url: string;
    filename: string;
}

class AudioService {
    private baseUrl = '/api';

    /**
     * Get audio information and streaming URL
     */
    async getAudioInfo(songId: string): Promise<AudioInfo> {
        const response = await fetch(`${this.baseUrl}/audio/info/${songId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to get audio info: ${response.statusText}`);
        }
        
        return response.json();
    }

    /**
     * Get download URL for a song
     */
    async getDownloadUrl(songId: string): Promise<AudioDownloadInfo> {
        const response = await fetch(`${this.baseUrl}/audio/download-url/${songId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to get download URL: ${response.statusText}`);
        }
        
        return response.json();
    }

    /**
     * Get streaming URL for a song
     */
    getStreamUrl(songId: string): string {
        return `${this.baseUrl}/audio/stream/${songId}`;
    }

    /**
     * Get basic streaming URL (without range support)
     */
    getBasicStreamUrl(songId: string): string {
        return `${this.baseUrl}/audio/stream-basic/${songId}`;
    }

    /**
     * Check if the audio file supports seeking
     */
    async checkSeekSupport(songId: string): Promise<boolean> {
        try {
            const audioInfo = await this.getAudioInfo(songId);
            return audioInfo.supports_seeking;
        } catch (error) {
            console.error('Error checking seek support:', error);
            return false;
        }
    }

    /**
     * Test if the audio stream is accessible
     */
    async testStream(songId: string): Promise<boolean> {
        try {
            const url = this.getStreamUrl(songId);
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.error('Error testing stream:', error);
            return false;
        }
    }
}

export const audioService = new AudioService();
export type { AudioInfo, AudioDownloadInfo }; 