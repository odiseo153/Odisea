import { Heart, Download, Play, Music, Trash, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SharedData, Song } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { usePlayer } from '@/contexts/PlayerContext';
import { songService } from '@/services/songService';

export function MusicCard({ song, destroy }: { song: Song, destroy?: (song: Song) => void }) {
    const { currentSong, isPlaying, playSong, togglePlay, handleFavorite } = usePlayer();
    const { auth } = usePage<SharedData>().props;


    const handleDestroy = () => {
        if (destroy) {
            destroy(song);
        }
    }

    const handlePlay = () => {
        if (currentSong?.id === song.id) {
            togglePlay();
        } else {
            playSong(song);
        }
    }

    /*
    const addInteraciont = async () => {
        try {
            await songService.addInteraciont(song.id,auth.user.id || "");
        } catch (error) {
            console.error('Error adding interaciont:', error);
        }
    }
    */

    const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;

    return (
    <Card className="group hover:bg-card/80 transition-all duration-200 cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
            {song.cover_url ? (
              <img src={song.cover_url} alt={`${song.title} cover`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                handlePlay();
              }}>
                {isCurrentlyPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                ) : (
                    <Play className="w-5 h-5 text-white" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Link href={`/music/${song.id}`} className="font-medium text-foreground truncate">{song.title}</Link>
            {song.artist && (
              <p className="text-sm text-muted-foreground truncate">{song.artist.name}</p>
            )}
            {song.album && (
              <p className="text-xs text-muted-foreground truncate">{song.album.name}</p>
            )}
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleFavorite(song.id, auth.user.id || "")}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                    song.is_favorite
                    ? 'text-red-500 fill-red-500'
                    : 'text-muted-foreground hover:text-red-400'
                }`}
              />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Download className="w-4 h-4" />
            </Button>
            {auth.user.id === song.added_by && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleDestroy}>
                <Trash className="w-4 h-4" />
              </Button>
            )}
          </div>

          {song.duration && (
            <span className="text-sm text-muted-foreground min-w-fit">{song.duration}</span>
          )}
        </div>

        {song.platform && (
          <div className="mt-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {song.platform.name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
    );
}
