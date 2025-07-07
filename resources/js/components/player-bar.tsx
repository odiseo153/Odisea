import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Heart, SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayer } from '@/contexts/PlayerContext';

export default function PlayerBar() {
    const { currentSong, isPlaying, togglePlay,setCurrentSong } = usePlayer();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(75);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Format time from seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (!isDragging) {
                setProgress(audio.currentTime);
            }
        };

        const setAudioDuration = () => {
            setDuration(audio.duration);
            // Asegurarse de que el progreso se reinicie cuando cambie la canción
            setProgress(0);
        };

        const handleEnded = () => {
            setProgress(0);
            togglePlay();
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', setAudioDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', setAudioDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [isDragging, togglePlay]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume / 100;
        audio.muted = isMuted;
    }, [volume, isMuted]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                toast.error('Error playing audio');
                togglePlay();
            });
        } else {
            audio.pause();
        }
    }, [isPlaying, togglePlay]);

    // Efecto para actualizar el audio cuando cambia la canción
    useEffect(() => {
        if (currentSong) {
            setProgress(0);
            setDuration(0);
        }
    }, [currentSong]);

    const toggleLike = () => {
        setIsLiked(!isLiked);
        toast.success(isLiked ? "Removed from Liked Songs" : "Added to Liked Songs");
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0]);
    };

    const handleProgressChange = (value: number[]) => {
        const newProgress = value[0];
        setProgress(newProgress);

        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = newProgress;
        }
    };

    const handleProgressDragStart = () => {
        setIsDragging(true);
    };

    const handleProgressDragEnd = () => {
        setIsDragging(false);
    };

    // Render audio or iframe depending on source
    const renderPlayer = () => {
        if (!currentSong) return null;

        const platform = currentSong.platform?.name?.toLowerCase() || 'local';
        const filePath = currentSong.download?.file_path || '';

        if (platform === 'youtube') {
            const videoId = new URL(filePath).searchParams.get('v');
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}`}
                    width="100%"
                    height="100"
                    allow="autoplay"
                    frameBorder="0"
                ></iframe>
            );
        } else if (platform === 'soundcloud') {
            return (
                <iframe
                    width="100%"
                    height="100"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(filePath)}&auto_play=${isPlaying}`}
                ></iframe>
            );
        } else {
            return (
                <audio ref={audioRef} src={filePath} />
            );
        }
    };

    if (!currentSong) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t p-4">
            {renderPlayer()}
            <div className="max-w-7xl mx-auto flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-1/4">
                        <img
                            src={currentSong.cover_url || "/placeholder.svg"}
                            alt={currentSong.title}
                            className="w-10 h-10 rounded-md object-cover"
                        />
                        <div className="min-w-0">
                            <div className="font-medium truncate">{currentSong.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{currentSong.artist?.name}</div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleLike}>
                            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                    </div>

                    <div className="flex flex-col items-center gap-1 flex-1 px-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <SkipBack className="h-4 w-4" />
                            </Button>
                            <Button size="icon" className="h-10 w-10 rounded-full" onClick={togglePlay}>
                                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <SkipForward className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="w-full flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(progress)}</span>
                            <Slider
                                value={[progress]}
                                max={duration || 100}
                                step={1}
                                onValueChange={handleProgressChange}
                                onPointerDown={handleProgressDragStart}
                                onPointerUp={handleProgressDragEnd}
                                className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-1/4 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute}>
                            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>

                        <Slider
                            value={[isMuted ? 0 : volume]}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                            className="w-24"
                        />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() =>  setCurrentSong(null)}>
                            <X />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
