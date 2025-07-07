import { Music } from 'lucide-react';
import { MusicCard } from './MusicCard';
import { Song } from '@/types';
import { toast } from 'sonner';
import { songService } from '@/services/songService';
import { useState } from 'react';

interface MusicGridProps {
  tracks: Song[];
}

export function MusicGrid({ tracks }: MusicGridProps) {
  const [tracksData, setTracksData] = useState<Song[]>(tracks);

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Music className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No music found</h3>
        <p className="text-muted-foreground">Try searching for your favorite songs or artists</p>
      </div>
    );
  }

  const destroy = async (song: Song) => {
    try {
      await songService.deleteSong(song.id);
      toast.success('Song deleted successfully');
      setTracksData(tracksData.filter((t) => t.id !== song.id));
    } catch (error) {
      console.error('Error deleting song:', error);
      toast.error('Failed to delete song');
    }
  };

  return (
    <div className="space-y-2">
      {tracksData.map((song) => (
        <MusicCard
          key={song.id}
          song={song}
          destroy={destroy}
        />
      ))}
    </div>
  );
}
