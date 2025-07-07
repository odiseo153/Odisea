import { createContext, useContext, useState, ReactNode } from 'react';
import { Song } from '@/types';
import { toast } from 'sonner';
import { songService } from '@/services/songService';

interface PlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    setCurrentSong: (song: Song) => void;
    togglePlay: () => void;
    playSong: (song: Song) => void;
    handleFavorite: (song_id: string, user_id: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    const playSong = (song: Song) => {
        setCurrentSong(song);
        setIsPlaying(true);
    };

    const handleFavorite = async (song_id: string, user_id: string) => {
        try {
            await songService.toggleFavorite(song_id, user_id);
            toast.success('Song favorited successfully');
        } catch (error) {
            console.error('Error favoriting song:', error);
            toast.error('Failed to favorite song');
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentSong,
            isPlaying,
            setCurrentSong,
            togglePlay,
            playSong,
            handleFavorite,
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
