import React from 'react';
import { Album, Artist, Playlist, Song } from '@/types';
import { Music } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from '@inertiajs/react';
import { AlbumCard } from './AlbumCard';
import { ArtistCard } from './ArtistCard';
import { PlaylistCard } from './PlaylistCard';

interface CardGridProps {
    items: (Album | Artist | Playlist | Song)[];
    type: string;
}

export function CardGrid({ items, type }: CardGridProps) {
    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search terms or filters</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Clear Filters
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {items.map((item) => {
                switch (type) {
                    case 'Album':
                        return <AlbumCard key={item.id} {...(item as Album)} />;
                    case 'Artist':
                        return <ArtistCard key={item.id} {...(item as Artist)} />;
                    case 'Playlist':
                        return <PlaylistCard key={item.id} {...(item as Playlist)} />;
                    case 'Song':
                        // Handle Song card separately if needed, or keep generic rendering
                        return (
                            <Link
                                key={item.id}
                                href={`/music/${item.id}`}
                                className="group relative aspect-square overflow-hidden rounded-md bg-muted"
                            >
                                <img
                                    src={(item as Song).cover_url || `https://picsum.photos/400/400?${Math.random()}`}
                                    alt={(item as Song).title || 'Song'}
                                    className="object-cover transition-all group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/50 p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                                    <h3 className="text-lg font-semibold">{(item as Song).title}</h3>
                                    {(item as Song).artist && (
                                        <p className="text-sm text-gray-300">{(item as Song).artist.name}</p>
                                    )}
                                    {(item as Song).album && (
                                        <p className="text-sm text-gray-300">{(item as Song).album.name}</p>
                                    )}
                                </div>
                            </Link>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );
}
