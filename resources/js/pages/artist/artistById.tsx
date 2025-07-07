"use client"

import * as React from "react"
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  Users,
  ExternalLink,
  Share2,
  ChevronLeft,
} from "lucide-react"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import AppLayout from "@/layouts/app-layout"
import { Artist, BreadcrumbItem } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Artist',
        href: '/artist',
    },
];

export default function ArtistPage({ artist }: { artist: Artist }) {
  const [isFollowing, setIsFollowing] = React.useState(false)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [showFullBio, setShowFullBio] = React.useState(false)

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
    toast.success(isFollowing ? "Unfollowed" : "Following")
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
    <Head title="Artist" />
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Button variant="secondary" size="sm" asChild className="gap-1 bg-black/20 backdrop-blur-sm border-white/20">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Hero section with cover image */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${artist.image_url})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-background" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Artist image */}
            <div className="relative">
              <img
                src={artist.image_url || "/placeholder.svg"}
                alt={artist.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-2xl"
              />
            </div>

            {/* Artist info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Artist</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">{artist.name}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{artist.interactions?.reduce((acc, interaction) => acc + (interaction.play_count || 0), 0)} monthly listeners</span>
                </div>
                <span>•</span>
                <span>{artist.interactions?.reduce((acc, interaction) => acc + (interaction.liked ? 1 : 0), 0)} followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-6 md:p-8 -mt-6 relative z-10">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg" className="h-12 px-8" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>

          <Button
            variant={isFollowing ? "outline" : "secondary"}
            size="lg"
            className="h-12 px-6"
            onClick={toggleFollow}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Artist
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Spotify
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-6 md:px-8 space-y-8">
        {/* Stats and genres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold">{artist.interactions?.reduce((acc, interaction) => acc + (interaction.play_count || 0), 0)}</div>
              <div className="text-sm text-muted-foreground">Total Plays</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold">{artist.interactions?.reduce((acc, interaction) => acc + (interaction.play_count || 0), 0)}</div>
              <div className="text-sm text-muted-foreground">Monthly Listeners</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold">{artist.interactions?.reduce((acc, interaction) => acc + (interaction.liked ? 1 : 0), 0)}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </CardContent>
          </Card>
        </div>

        {/* Genres and social links */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {artist.songs?.map((song) => (
                <Badge key={song.id} variant="secondary" className="text-sm">
                  {song.title}
                </Badge>
              ))}
            </div>
          </div>


        </div>

        <Separator />

        {/* Biography */}
        <div>
          <h2 className="text-2xl font-bold mb-4">About</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {showFullBio ? artist.bio : `${artist.bio?.substring(0, 300)}...`}
            </p>
            <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setShowFullBio(!showFullBio)}>
              {showFullBio ? "Show less" : "Show more"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Popular tracks */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Popular</h2>
          <div className="space-y-2">
            {artist.songs?.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center justify-center w-8 text-muted-foreground group-hover:hidden">
                  {index + 1}
                </div>
                <div className="hidden group-hover:flex items-center justify-center w-8">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>

                <img src={track.cover_url || "/placeholder.svg"} alt={track.title} className="w-12 h-12 rounded" />

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{track.title}</div>
                  <div className="text-sm text-muted-foreground">{track.interactions?.find((interaction) => interaction.song?.id === track.id)?.play_count || 0} plays</div>
                </div>

                <div className="text-sm text-muted-foreground">{track.duration}</div>

                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                  <Heart className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Add to playlist</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Albums */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {artist.albums?.map((album) => (
              <Card key={album.id} className="group cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="relative mb-3">
                    <img
                      src={album.cover_url || "/placeholder.svg"}
                      alt={album.name}
                      className="w-full aspect-square object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                      <Button size="icon" className="h-12 w-12 rounded-full">
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold truncate">{album.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {album.year} • {album.songs?.length} songs
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Related artists */}
        <div className="pb-8">
          <h2 className="text-2xl font-bold mb-6">Fans also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artist.albums?.map((relatedArtist) => (
              <Card key={relatedArtist.id} className="group cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="relative mb-3">
                    <img
                      src={relatedArtist.cover_url || "/placeholder.svg"}
                      alt={relatedArtist.name}
                      className="w-full aspect-square object-cover rounded-full mx-auto"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <Button size="icon" className="h-12 w-12 rounded-full">
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold truncate">{relatedArtist.name}</h3>
                  <p className="text-sm text-muted-foreground">Artist</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
