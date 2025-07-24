import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Heart, SkipBack, SkipForward, Play, Pause, Volume2, VolumeX, X, ChevronUp, Menu } from 'lucide-react';
import { toast } from 'sonner';
import { usePlayer } from '@/contexts/PlayerContext';
import { audioService } from '@/services/audioService';

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
    const [isExpanded, setIsExpanded] = useState(false);

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Audio event handlers
    const handleLoadedMetadata = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            setDuration(audio.duration);
            setIsLoading(false);
            setIsSeekable(audio.seekable && audio.seekable.length > 0);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (isDragging) return;
        const audio = audioRef.current;
        if (audio) {
            setProgress(audio.currentTime);
            setCurrentTime(audio.currentTime);
        }
    }, [setCurrentTime, isDragging]);

    const handleEnded = useCallback(() => {
        setProgress(0);
        setCurrentTime(0);
        togglePlay();
    }, [togglePlay, setCurrentTime]);

    const handleError = useCallback((e: any) => {
        console.error('Audio error:', e);
        toast.error('Error loading audio - check console for details');
        setIsLoading(false);
    }, []);

    // Control functions
    const toggleLike = useCallback(() => {
        setIsLiked(prev => !prev);
        toast.success(isLiked ? "Removed from Liked Songs" : "Added to Liked Songs");
    }, [isLiked]);

    const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);

    const handleVolumeChange = useCallback((value: number[]) => {
        const newVolume = value[0] / 100;
        setVolume(newVolume);
        if (newVolume > 0) setIsMuted(false);
    }, []);

    const handleProgressChange = useCallback((value: number[]) => {
        if (!isSeekable) return;
        const newProgress = value[0];
        setProgress(newProgress);
        setCurrentTime(newProgress);
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, Math.min(newProgress, duration));
        }
    }, [duration, setCurrentTime, isSeekable]);

    const handleProgressDragStart = useCallback(() => setIsDragging(true), []);
    const handleProgressDragEnd = useCallback(() => setIsDragging(false), []);
    const closePlayers = useCallback(() => setCurrentSong(null), [setCurrentSong]);

    // Effects
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.play().catch(() => {
                toast.error('Error playing audio');
                togglePlay();
            });
        } else {
            audio.pause();
        }
    }, [isPlaying, togglePlay]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) audio.volume = isMuted ? 0 : volume;
    }, [volume, isMuted]);

    useEffect(() => {
        if (currentSong) {
            setDuration(0);
            setProgress(0);
            setIsLoading(true);
            setIsSeekable(false);
        }
    }, [currentSong]);

    if (!currentSong) return null;

    const getAudioSource = () => {
        const url = currentSong?.id ? audioService.getStreamUrl(currentSong.id) : '';
        console.log('Audio source URL:', url);
        return url;
    };



    return (
        <>
            {/* Audio element */}
            <audio
                ref={audioRef}
                src={getAudioSource()}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onError={handleError}
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                preload="metadata"
                crossOrigin="anonymous"
                style={{ display: 'none' }}
            />

            {/* Mobile Player - Completamente independiente */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-md border-t shadow-2xl">
                <div className="px-3 py-2">
                    {/* Expandir/Contraer */}
                    <div className="flex justify-center mb-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-5 px-2 text-muted-foreground"
                        >
                            <ChevronUp className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                    </div>

                    {/* Vista expandida - Controles extra */}
                    {isExpanded && (
                        <div className="space-y-3 mb-3 px-2">
                            {/* Progress bar */}
                            <div className="space-y-1">
                                <Slider
                                    value={[progress]}
                                    max={duration || 100}
                                    step={0.1}
                                    onValueChange={handleProgressChange}
                                    onPointerDown={handleProgressDragStart}
                                    onPointerUp={handleProgressDragEnd}
                                    className="w-full"
                                    disabled={!duration || !isSeekable}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>{formatTime(progress)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>
                            
                            {/* Volume */}
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" onClick={toggleMute} className="h-7 w-7 flex-shrink-0">
                                    {isMuted || volume === 0 ? (
                                        <VolumeX className="h-3.5 w-3.5" />
                                    ) : (
                                        <Volume2 className="h-3.5 w-3.5" />
                                    )}
                                </Button>
                                <Slider
                                    value={[isMuted ? 0 : volume * 100]}
                                    max={100}
                                    step={1}
                                    onValueChange={handleVolumeChange}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Main controls - Siempre visible */}
                    <div className="flex items-center gap-2">
                        {/* Song info */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="relative flex-shrink-0">
                                <img
                                    src={currentSong.cover_url || "/placeholder.svg"}
                                    alt={currentSong.title}
                                    className="w-11 h-11 rounded-lg object-cover shadow-sm"
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold truncate text-sm leading-tight">{currentSong.title}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {currentSong.artist?.name || 'Unknown Artist'}
                                </div>
                            </div>
                        </div>

                        {/* Control buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Button variant="ghost" size="sm" onClick={toggleLike} className="h-9 w-9">
                                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                            </Button>
                            
                            <Button variant="ghost" size="sm" className="h-9 w-9">
                                <SkipBack className="h-4 w-4" />
                            </Button>
                            
                            <Button 
                                size="sm" 
                                className="h-11 w-11 rounded-full shadow-lg" 
                                onClick={togglePlay}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : isPlaying ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="h-5 w-5 ml-0.5" />
                                )}
                            </Button>
                            
                            <Button variant="ghost" size="sm" className="h-9 w-9">
                                <SkipForward className="h-4 w-4" />
                            </Button>
                            
                            <Button variant="ghost" size="sm" onClick={closePlayers} className="h-9 w-9">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Player - Oculto en móvil */}
            <div className="hidden sm:block fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-6">
                        {/* Song Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1 max-w-sm">
                            <div className="relative">
                                <img
                                    src={currentSong.cover_url || "/placeholder.svg"}
                                    alt={currentSong.title}
                                    className="w-14 h-14 rounded-lg object-cover shadow-sm"
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{currentSong.title}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                    {currentSong.artist?.name || 'Unknown Artist'}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={toggleLike}>
                                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                            </Button>
                        </div>

                        {/* Controls Center */}
                        <div className="flex flex-col items-center gap-2 flex-1 min-w-0 max-w-xl">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon">
                                    <SkipBack className="h-4 w-4" />
                                </Button>
                                <Button 
                                    size="icon" 
                                    className="h-12 w-12 rounded-full" 
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
                                <Button variant="ghost" size="icon">
                                    <SkipForward className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="w-full flex items-center gap-3">
                                <span className="text-xs text-muted-foreground w-12 text-right font-mono">
                                    {formatTime(progress)}
                                </span>
                                <Slider
                                    value={[progress]}
                                    max={duration || 100}
                                    step={0.1}
                                    onValueChange={handleProgressChange}
                                    onPointerDown={handleProgressDragStart}
                                    onPointerUp={handleProgressDragEnd}
                                    className="flex-1"
                                    disabled={!duration || !isSeekable}
                                />
                                <span className="text-xs text-muted-foreground w-12 font-mono">
                                    {formatTime(duration)}
                                </span>
                            </div>
                        </div>

                        {/* Volume and Close */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Button variant="ghost" size="icon" onClick={toggleMute}>
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
                                className="w-24"
                            />
                            <Button variant="ghost" size="icon" onClick={closePlayers}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}