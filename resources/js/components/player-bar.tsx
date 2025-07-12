import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Heart, SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayer } from '@/contexts/PlayerContext';

export default function PlayerBar() {
    const { currentSong, isPlaying, togglePlay, setCurrentSong, currentTime, setCurrentTime } = usePlayer();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(75);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    // Format time from seconds to MM:SS
    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Enhanced audio event handlers
    const handleTimeUpdate = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || isDragging) return;
        setProgress(audio.currentTime);
        setCurrentTime(audio.currentTime);
    }, [isDragging, setCurrentTime]);

    const handleLoadedMetadata = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        setDuration(audio.duration);
        
        // If this is the first load and we have saved time, restore it
        if (isFirstLoad && currentTime > 0 && currentTime < audio.duration) {
            audio.currentTime = currentTime;
            setProgress(currentTime);
            setIsFirstLoad(false);
        } else {
            setProgress(audio.currentTime);
        }
        
        setIsLoading(false);
    }, [isFirstLoad, currentTime]);

    const handleCanPlay = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleLoadStart = useCallback(() => {
        setIsLoading(true);
    }, []);

    const handleError = useCallback((error: Event) => {
        console.error('Audio error:', error);
        toast.error('Error loading audio');
        setIsLoading(false);
    }, []);

    const handleEnded = useCallback(() => {
        setProgress(0);
        togglePlay();
    }, [togglePlay]);

    // Setup audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('loadstart', handleLoadStart);
        audio.addEventListener('error', handleError);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('loadstart', handleLoadStart);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [handleTimeUpdate, handleLoadedMetadata, handleCanPlay, handleLoadStart, handleError, handleEnded]);

    // Volume and mute control
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume / 100;
        audio.muted = isMuted;
    }, [volume, isMuted]);

    // Play/pause control
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing audio:', error);
                    toast.error('Error playing audio');
                    togglePlay();
                });
            }
        } else {
            audio.pause();
        }
    }, [isPlaying, togglePlay]);

    // Reset when song changes
    useEffect(() => {
        if (currentSong) {
            setDuration(0);
            setIsLoading(true);
            setIsFirstLoad(true);
            // Don't reset progress here - let handleLoadedMetadata handle it
        }
    }, [currentSong]);

    // Enhanced handlers
    const toggleLike = useCallback(() => {
        setIsLiked(prev => {
            const newState = !prev;
            toast.success(newState ? "Added to Liked Songs" : "Removed from Liked Songs");
            return newState;
        });
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const handleVolumeChange = useCallback((value: number[]) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    }, [isMuted]);

    const handleProgressChange = useCallback((value: number[]) => {
        const newProgress = value[0];
        setProgress(newProgress);
        setCurrentTime(newProgress);

        const audio = audioRef.current;
        if (audio && duration > 0) {
            audio.currentTime = newProgress;
        }
    }, [duration, setCurrentTime]);

    const handleProgressDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleProgressDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const closePlayers = useCallback(() => {
        setCurrentSong(null);
    }, [setCurrentSong]);

    // Enhanced player renderer with better error handling
    const renderPlayer = () => {
        if (!currentSong) return null;

        const platform = currentSong.platform?.name?.toLowerCase() || 'local';
        const filePath = currentSong.download?.file_path || '';

        if (platform === 'youtube') {
            const videoId = new URL(filePath).searchParams.get('v');
            if (!videoId) {
                toast.error('Invalid YouTube URL');
                return null;
            }
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1&rel=0`}
                    width="100%"
                    height="100"
                    allow="autoplay"
                    frameBorder="0"
                    style={{ display: 'none' }} // Hide iframe player
                    title="YouTube Player"
                />
            );
        } else if (platform === 'soundcloud') {
            return (
                <iframe
                    width="100%"
                    height="100"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(filePath)}&auto_play=${isPlaying}&hide_related=true&show_artwork=false&visual=false`}
                    style={{ display: 'none' }} // Hide iframe player
                    title="SoundCloud Player"
                />
            );
        } else {
            return (
                <audio 
                    ref={audioRef} 
                    src={filePath}
                    preload="metadata"
                />
            );
        }
    };

    if (!currentSong) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg">
            {renderPlayer()}
            <div className="max-w-7xl mx-auto p-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Song Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xs">
                        <div className="relative">
                            <img
                                src={currentSong.cover_url || "/placeholder.svg"}
                                alt={currentSong.title}
                                className="w-12 h-12 rounded-md object-cover"
                            />
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium truncate text-sm">{currentSong.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                                {currentSong.artist?.name || 'Unknown Artist'}
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 flex-shrink-0" 
                            onClick={toggleLike}
                        >
                            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <SkipBack className="h-4 w-4" />
                            </Button>
                            <Button 
                                size="icon" 
                                className="h-10 w-10 rounded-full" 
                                onClick={togglePlay}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : isPlaying ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="h-5 w-5 ml-0.5" />
                                )}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <SkipForward className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="w-full flex items-center gap-3 max-w-lg">
                            <span className="text-xs text-muted-foreground w-10 text-right font-mono">
                                {formatTime(progress)}
                            </span>
                            <Slider
                                value={[progress]}
                                max={duration || 100}
                                step={1}
                                onValueChange={handleProgressChange}
                                onPointerDown={handleProgressDragStart}
                                onPointerUp={handleProgressDragEnd}
                                className="flex-1"
                                disabled={!duration}
                            />
                            <span className="text-xs text-muted-foreground w-10 font-mono">
                                {formatTime(duration)}
                            </span>
                        </div>
                    </div>

                    {/* Volume and Close */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={toggleMute}
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </Button>
                        <Slider
                            value={[isMuted ? 0 : volume]}
                            max={100}
                            step={1}
                            onValueChange={handleVolumeChange}
                            className="w-20"
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={closePlayers}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}