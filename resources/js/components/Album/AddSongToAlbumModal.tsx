import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Song, Album } from '@/types';
import { songService } from '@/services/songService';
import { albumService } from '@/services/albumService';
import {
    DialogDescription,
} from "@/components/ui/dialog";
import { Music, Plus } from "lucide-react";

interface AddSongToAlbumModalProps {
    album: Album;
    onSongAdded?: (song: Song) => void;
    trigger?: React.ReactNode;
}

export function AddSongToAlbumModal({ album, onSongAdded, trigger }: AddSongToAlbumModalProps) {
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
            await albumService.addSongToAlbum(album.id, song.id);
            toast.success(`Added "${song.title}" to ${album.name}`);

            if (onSongAdded) {
                onSongAdded(song);
            }

            setIsOpen(false);
            setSearchQuery('');
            setSearchResults([]);
        } catch (error: any) {
            console.error('Error adding song to album:', error);

            // Handle specific error messages
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to add song to album. Please try again.");
            }
        }
    };

    const defaultTrigger = (
        <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Songs to Album
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Add Songs to {album.name}</DialogTitle>
                    <DialogDescription>
                        Search for songs to add to this album
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <Input
                        type="text"
                        placeholder="Search songs..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full"
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
                                <div key={song.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                                            {song.cover_url ? (
                                                <img
                                                    src={song.cover_url}
                                                    alt={`${song.title} cover`}
                                                    className="w-full h-full object-cover"
                                                />
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
                                                <p className="text-xs text-muted-foreground truncate">
                                                    Current album: {song.album.name}
                                                </p>
                                            )}
                                            {song.duration && (
                                                <p className="text-xs text-muted-foreground">{song.duration}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {song.album?.id === album.id && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                Already in album
                                            </span>
                                        )}
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddSong(song)}
                                            disabled={song.album?.id === album.id}
                                            className="ml-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery.length > 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No songs found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>Start typing to search for songs</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
