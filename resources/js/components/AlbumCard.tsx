import { Heart, Download, Music, Calendar, Info, Edit, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Album } from '@/types';
import { Link } from '@inertiajs/react';
import { AlbumModal, AddSongToAlbumModal } from '@/components/Album';

export function AlbumCard({id, name, artist, cover_url, year, songs }: Album) {
  return (
    <Card className="group hover:shadow-lg hover:ring-2 hover:ring-primary/30 transition-all duration-200 cursor-pointer bg-background/80">
      <CardContent className="p-4 flex flex-col items-center gap-3">
        {/* Nombre arriba */}
        <h3 className="font-bold text-lg text-foreground truncate w-full text-center group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Imagen en el medio */}
        <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden shadow-md my-2 flex-shrink-0">
          <img
            src={cover_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`}
            alt={`${name} cover`}
            className="w-full h-full object-cover"
          />

        </div>

        {/* Demás info abajo de la imagen */}
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground truncate">
              {artist?.name ? `By ${artist.name}` : 'Unknown Artist'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {year && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              >
                <Calendar className="w-3 h-3" />
                {year}
              </Badge>
            )}
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              <Music className="w-3 h-3" />
              {songs?.length ?? 0}
            </Badge>
          </div>
          {/* Géneros si existen */}
          {songs && songs.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {Array.from(
                new Set(
                  songs
                    .flatMap(song => song.genders?.map(g => g.name) || [])
                    .filter(Boolean)
                )
              ).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
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

            <AlbumModal
              album={{id, name, artist, cover_url, year, songs}}
              onSuccess={() => window.location.reload()}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 p-0 hover:bg-primary/10 group"
                  aria-label="Edit album"
                  tabIndex={0}
                >
                  <Edit className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              }
            />

            <AddSongToAlbumModal
              album={{id, name, artist, cover_url, year, songs}}
              onSongAdded={() => window.location.reload()}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 p-0 hover:bg-primary/10 group"
                  aria-label="Add songs to album"
                  tabIndex={0}
                >
                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              }
            />

            <Link
              href={`/album/${id}`}
              className="h-9 w-9 p-0 flex items-center justify-center rounded-full hover:bg-primary/10 group transition-colors"
              aria-label="View album details"
              tabIndex={0}
            >
              <Info className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
