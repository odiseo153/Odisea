import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Song, Playlist } from '@/types';
import { songService } from '@/services/songService';
import { playlistService } from '@/services/playlistService';
import {
    DialogDescription,
} from "@/components/ui/dialog";
import { Music, Plus } from "lucide-react";

interface AddSongToPlaylistModalProps {
    playlist: Playlist;
    onSongAdded?: (song: Song) => void;
}

export function AddSongToPlaylistModal({ playlist, onSongAdded }: AddSongToPlaylistModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;

        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await songService.searchSongs(query);
            setSearchResults(response.results as Song[]);
        } catch (error) {
            console.error('Error searching songs:', error);
            toast.error("Failed to search songs. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSong = async (song: Song) => {
        try {
            await playlistService.addSongToPlaylist(playlist.id as string, song.id as string);
            toast.success(`Added "${song.title}" to ${playlist.name}`);

            if (onSongAdded) {
                onSongAdded(song);
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Error adding song to playlist:', error);
            toast.error("Failed to add song to playlist. Please try again.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Songs
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Add Songs to {playlist.name}</DialogTitle>
                    <DialogDescription>
                        Search for songs to add to your playlist
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Search songs..."
                        className="w-full p-2 rounded-md border border-border"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>

                <div className="mt-4 max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-2">
                            {searchResults.map((song) => (
                                <div key={song.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                                            {song.cover_url ? (
                                                <img src={song.cover_url} alt={`${song.title} cover`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Music className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-foreground truncate">{song.title}</h3>
                                            {song.artist && (
                                                <p className="text-sm text-muted-foreground truncate">{song.artist.name}</p>
                                            )}
                                            {song.album && (
                                                <p className="text-xs text-muted-foreground truncate">{song.album.name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => handleAddSong(song)}
                                        className="ml-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery.length > 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No songs found
                        </div>
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
}
