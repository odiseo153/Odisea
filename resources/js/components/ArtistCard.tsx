import { Heart, Download, Play, Info, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Artist, Song } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

export function ArtistCard({ id, name, image_url, bio, songs, is_public }: Artist) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTrack, setCurrentTrack] = useState<number | null>(null)

    // Function to play a specific track
    const playTrack = (trackId: number) => {
        setCurrentTrack(trackId)
        setIsPlaying(true)
    }
    return (
    <Card className="group hover:shadow-lg hover:ring-2 hover:ring-primary/30 transition-all duration-200 cursor-pointer bg-background/80">
      <CardContent className="p-4 flex flex-col items-center gap-3">
        {/* Imagen del artista centrada y más grande */}
        <div className="relative w-24 h-24 bg-muted rounded-full overflow-hidden shadow-md my-2 flex-shrink-0">
          <img
            src={image_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`}
            alt={`${name} cover`}
            className="w-full h-full object-cover"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            tabIndex={-1}
          >
            <Play className="w-5 h-5 text-primary" />
          </Button>
        </div>

        {/* Nombre y bio */}
        <div className="flex flex-col items-center gap-1 w-full">
          <h3 className="font-bold text-lg text-foreground truncate w-full text-center group-hover:text-primary transition-colors">
            {name}
          </h3>
          {bio && (
            <p className="text-sm text-muted-foreground text-center line-clamp-2 max-w-xs">
              {bio}
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
            <Badge
              variant={is_public ? "default" : "secondary"}
              className={`text-xs px-2 py-0.5 rounded-full ${is_public ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
            >
              {is_public ? "Public" : "Private"}
            </Badge>
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              <Music className="w-3 h-3" />
              {songs?.length ?? 0}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 p-0 hover:bg-primary/10 group"
              aria-label="Like album"
              tabIndex={0}
            >
              <Heart className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 p-0 hover:bg-primary/10 group"
              aria-label="Download album"
              tabIndex={0}
            >
              <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
            <Link
              href={`/artists/${id}`}
              className="h-9 w-9 p-0 flex items-center justify-center rounded-full hover:bg-primary/10 group transition-colors"
              aria-label="View album details"
              tabIndex={0}
            >
              <Info className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
      </CardContent>
    </Card>
  );
}
