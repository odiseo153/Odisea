import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Song } from '@/types';
import { toast } from 'sonner';
import { songService } from '@/services/songService';

interface PlayerContextType {
    currentSong: Song | null;
    isPlaying: boolean;
    currentTime: number;
    setCurrentSong: (song: Song | null) => void;
    togglePlay: () => void;
    playSong: (song: Song) => void;
    handleFavorite: (song_id: string, user_id: string) => void;
    setCurrentTime: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Keys for localStorage
const STORAGE_KEYS = {
    CURRENT_SONG: 'odisea_current_song',
    IS_PLAYING: 'odisea_is_playing',
    CURRENT_TIME: 'odisea_current_time'
};

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentSong, setCurrentSongState] = useState<Song | null>(null);
    const [isPlaying, setIsPlayingState] = useState(false);
    const [currentTime, setCurrentTimeState] = useState(0);

    // Load state from localStorage on component mount
    useEffect(() => {
        const savedSong = localStorage.getItem(STORAGE_KEYS.CURRENT_SONG);
        const savedIsPlaying = localStorage.getItem(STORAGE_KEYS.IS_PLAYING);
        const savedCurrentTime = localStorage.getItem(STORAGE_KEYS.CURRENT_TIME);

        if (savedSong) {
            try {
                setCurrentSongState(JSON.parse(savedSong));
            } catch (error) {
                console.error('Error parsing saved song:', error);
            }
        }

        if (savedIsPlaying) {
            setIsPlayingState(savedIsPlaying === 'true');
        }

        if (savedCurrentTime) {
            setCurrentTimeState(parseFloat(savedCurrentTime));
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (currentSong) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_SONG, JSON.stringify(currentSong));
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_SONG);
        }
    }, [currentSong]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.IS_PLAYING, isPlaying.toString());
    }, [isPlaying]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.CURRENT_TIME, currentTime.toString());
    }, [currentTime]);

    const setCurrentSong = (song: Song | null) => {
        setCurrentSongState(song);
        if (song) {
            // Don't reset current time when changing songs programmatically
            // This will be handled by the player component
        } else {
            setCurrentTimeState(0);
        }
    };

    const togglePlay = () => {
        setIsPlayingState(prev => !prev);
    };

    const playSong = (song: Song) => {
        const isSameSong = currentSong && currentSong.id === song.id;
        
        if (!isSameSong) {
            setCurrentSongState(song);
            setCurrentTimeState(0); // Reset time only when changing songs
        }
        
        setIsPlayingState(true);
    };

    const setCurrentTime = (time: number) => {
        setCurrentTimeState(time);
    };

    const handleFavorite = async (song_id: string, user_id: string) => {
        try {
            await songService.toggleFavorite(song_id, user_id);
        } catch (error) {
            console.error('Error favoriting song:', error);
            toast.error('Failed to favorite song');
        }
    };

    return (
        <PlayerContext.Provider value={{
            currentSong,
            isPlaying,
            currentTime,
            setCurrentSong,
            togglePlay,
            playSong,
            handleFavorite,
            setCurrentTime,
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
