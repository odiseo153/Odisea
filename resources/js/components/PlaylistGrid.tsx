import { ListMusic } from 'lucide-react';
import { Playlist } from '@/types';
import { PlaylistCard } from './PlaylistCard';

interface PlaylistGridProps {
  tracks: Playlist[];
}

export function PlaylistGrid({ tracks }: PlaylistGridProps) {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <ListMusic  className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No playlists found</h3>
        <p className="text-muted-foreground">Try searching for your favorite Playlists</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          id={playlist.id}
          name={playlist.name}
          user={playlist.user}
          songs={playlist.songs}
          is_public={playlist.is_public}
        />
      ))}
    </div>
  );
}