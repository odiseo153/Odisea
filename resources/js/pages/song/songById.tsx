"use client"

import * as React from "react"
import {
  Play,
  Pause,
  Heart,
  Share2,
  MoreHorizontal,
  ChevronLeft,
  Music,
  Mic2,
  ListMusic,
  Clock,
  Calendar,
  BarChart3,
  Plus,
  Pencil,
  ExternalLink,
} from "lucide-react"
import { Link, usePage } from "@inertiajs/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { BreadcrumbItem, SharedData, Song } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { usePlayer } from "@/contexts/PlayerContext"
import EditSong from '@/components/Music/EditSong';


const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Music",
    href: "/music",
  },
];

export default function SongById({ song }: { song: Song }) {
  const [isLiked, setIsLiked] = React.useState(song.is_favorite)
  const [activeTab, setActiveTab] = React.useState("lyrics")
  const { handleFavorite,togglePlay,setCurrentSong,isPlaying } = usePlayer();
  const { auth } = usePage<SharedData>().props;


  const toggleLike = () => {
    handleFavorite(song.id, auth.user.id as string)
    setIsLiked(!isLiked)
    toast.success(song.is_favorite ? "Removed from Liked Songs" : "Added to Liked Songs")
  }

  const togglePlaySong = () => {
    setCurrentSong(song);
    togglePlay();
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      {/* Back button */}
      <div className="p-6 pb-0">
        <Button variant="ghost" size="sm" asChild className="gap-1 -ml-2">
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* song header */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Album cover */}
          <div className="relative group w-full max-w-[300px] aspect-square rounded-lg overflow-hidden shadow-2xl">
            <img
              src={song.cover_url || "/placeholder.svg"}
              alt={song.title || "Song cover"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button size="icon" className="h-16 w-16 rounded-full" onClick={togglePlaySong}>
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
              </Button>
            </div>
          </div>

          {/* song info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>Song</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4">{song.title}</h1>

            <div className="flex items-center gap-3 mb-4">
              <Link href={`/artists/${song.artist?.id}`} className="flex items-center gap-2 hover:underline">
                <img
                  src={song.artist?.image_url || "/placeholder.svg"}
                  alt={song.artist?.name || "Artist image"}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold text-lg">{song.artist?.name}</span>
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href={`/album/${song.album?.id}`}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                {song.album?.name}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Released {new Date(song.created_at || "").toDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Duration {song.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span>{song.genders?.map((gender) => gender.name).join(", ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>{song.play_count} plays</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="gap-2" onClick={togglePlaySong}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <Button
                variant={isLiked ? "default" : "outline"}
                className={`gap-2 ${isLiked ? "bg-red-600 hover:bg-red-700" : ""}`}
                onClick={toggleLike}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-white" : ""}`} />
                {isLiked ? "Liked" : "Like"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Spotify
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              { song.added_by == auth.user.id &&
                    <EditSong song={song} />
                }
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* song content tabs */}
      <div className="p-6 md:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="lyrics" className="gap-2">
              <Mic2 className="h-4 w-4" />
              Lyrics
            </TabsTrigger>
            <TabsTrigger value="similar" className="gap-2">
              <ListMusic className="h-4 w-4" />
              Other songs
            </TabsTrigger>
          </TabsList>

{/*
          <TabsContent value="lyrics" className="space-y-4">
            <div className="bg-accent/30 rounded-lg p-6 max-w-2xl mx-auto">
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{song.lyrics}</pre>
            </div>
          </TabsContent>
              */}

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Mic2 className="h-5 w-5" />
                    Credits
                  </h3>
                  <div className="space-y-4">

                    <div>
                      <h4 className="text-sm text-muted-foreground mb-2">Writers</h4>
                      <div className="flex flex-wrap gap-2">
                        {song.interactions?.map((interaction) => (
                          <Badge key={interaction.id} variant="secondary">
                            {interaction?.user?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="similar" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {song.other_songs?.map((other_song) => (
                <Link href={`/song/${other_song.id}`} key={other_song.id}>
                  <Card className="group cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="relative">
                        <img
                          src={other_song.cover_url || "/placeholder.svg"}
                          alt={other_song.title}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{other_song.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{other_song.artist?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{other_song.album?.name || "Unknown Album"}</p>
                      </div>

                      <div className="text-sm text-muted-foreground">{other_song.duration}</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Player bar */}
    </AppLayout>
  )
}
