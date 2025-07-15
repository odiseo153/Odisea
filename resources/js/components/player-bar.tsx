import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Heart, SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayer } from '@/contexts/PlayerContext';
import {audioService} from '@/services/audioService';

export default function PlayerBar() {
    const { currentSong, isPlaying, togglePlay, setCurrentSong, setCurrentTime } = usePlayer();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.75);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isSeekable, setIsSeekable] = useState(false);


    // Format time from seconds to MM:SS
    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Audio event handlers
    const handlePlay = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handlePause = useCallback(() => {
        // Pause event handler
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            setDuration(audio.duration);
            setIsLoading(false);
            
            // Check if the audio is seekable
            if (audio.seekable && audio.seekable.length > 0) {
                setIsSeekable(true);
            }
        }
    }, []);

    const handleCanPlay = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            setIsSeekable(audio.seekable && audio.seekable.length > 0);
            setIsLoading(false);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (isDragging) return; // Don't update progress while dragging

        const audio = audioRef.current;
        if (audio) {
            const currentTime = audio.currentTime;
            setProgress(currentTime);
            setCurrentTime(currentTime);
        }
    }, [setCurrentTime, isDragging]);

    const handleEnded = useCallback(() => {
        setProgress(0);
        setCurrentTime(0);
        togglePlay();
    }, [togglePlay, setCurrentTime]);

    const handleError = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
        console.error('Audio error:', e);
        const errorMessage = e.currentTarget?.error?.message || 'Unknown audio error';
        toast.error(`Error loading audio: ${errorMessage}`);
        setIsLoading(false);
        setIsSeekable(false);
    }, []);

    const handleLoadStart = useCallback(() => {
        setIsLoading(true);
    }, []);

    const handleWaiting = useCallback(() => {
        setIsLoading(true);
    }, []);

    const handleCanPlayThrough = useCallback(() => {
        setIsLoading(false);
    }, []);

    // Control functions
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
        const newVolume = value[0] / 100;
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    }, [isMuted]);

    const handleProgressChange = useCallback((value: number[]) => {
        if (!isSeekable) return;
        
        const newProgress = value[0];
        setProgress(newProgress);
        setCurrentTime(newProgress);

        const audio = audioRef.current;
        if (audio && duration > 0) {
            // Ensure the time is within bounds
            const seekTime = Math.max(0, Math.min(newProgress, duration));
            
            try {
                audio.currentTime = seekTime;
            } catch (error) {
                console.error('Error seeking audio:', error);
                toast.error('Unable to seek to this position');
            }
        }
    }, [duration, setCurrentTime, isSeekable]);

    const handleProgressDragStart = useCallback(() => {
        setIsDragging(true);
    }, []);

    const handleProgressDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    const closePlayers = useCallback(() => {
        setCurrentSong(null);
    }, [setCurrentSong]);

    // Control play/pause manually
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

    // Set volume and mute
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // Reset when song changes
    useEffect(() => {
        if (currentSong) {
            setDuration(0);
            setProgress(0);
            setIsLoading(true);
            setIsDragging(false);
            setIsSeekable(false);
        }
    }, [currentSong]);

    // Setup time update interval for better progress tracking
    useEffect(() => {
        if (!isPlaying || isDragging) return;

        const interval = setInterval(() => {
            const audio = audioRef.current;
            if (audio && !isDragging) {
                const currentTime = audio.currentTime;
                setProgress(currentTime);
                setCurrentTime(currentTime);
            }
        }, 100); // Update every 100ms for smoother progress

        return () => clearInterval(interval);
    }, [isPlaying, isDragging, setCurrentTime]);

    if (!currentSong) {
        return null;
    }

    // Get audio source - use server streaming endpoint
    const getAudioSource = () => {
        if (!currentSong?.id) return '';
        
        // Always use the server streaming endpoint for better seeking support
        return audioService.getStreamUrl(currentSong.id);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-lg">
            {/* Audio element */}
            <audio
                ref={audioRef}
                src={getAudioSource()}
                onPlay={handlePlay}
                onPause={handlePause}
                onEnded={handleEnded}
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleCanPlay}
                onTimeUpdate={handleTimeUpdate}
                onError={handleError}
                onLoadStart={handleLoadStart}
                onWaiting={handleWaiting}
                onCanPlayThrough={handleCanPlayThrough}
                preload="metadata"
                crossOrigin="anonymous"
                style={{ display: 'none' }}
            />

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
                                step={0.1}
                                onValueChange={handleProgressChange}
                                onPointerDown={handleProgressDragStart}
                                onPointerUp={handleProgressDragEnd}
                                className={`flex-1 ${!isSeekable ? 'opacity-50' : ''}`}
                                disabled={!duration || !isSeekable}
                            />
                            <span className="text-xs text-muted-foreground w-10 font-mono">
                                {formatTime(duration)}
                            </span>
                        </div>
                        {!isSeekable && duration > 0 && (
                            <div className="text-xs text-muted-foreground text-center">
                                Seeking not available for this audio source
                            </div>
                        )}
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
                            value={[isMuted ? 0 : volume * 100]}
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