"use client"

import * as React from "react"
import {
  Play,
  Pause,
  MoreHorizontal,
  Share2,
  Download,
  Trash2,
  ChevronLeft,
  Edit,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem, Playlist, SharedData, Song } from "@/types"
import { MusicCard } from "@/components/Music/MusicCard"
import { toast } from "sonner"
import { AddSongToPlaylistModal } from "@/components/Music/AddSongToPlaylistModal"
import { PlaylistModal } from "@/components/Playlist/PlaylistModal"
import { usePage } from "@inertiajs/react"
import { playlistService } from '@/services/playlistService'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Playlists',
    href: '/playlists',
  },
]
export default function PlaylistPage({ playlistData }: { playlistData: Playlist }) {
  const { auth } = usePage<SharedData>().props;
  const [playlist, setPlaylist] = React.useState(playlistData)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const image = playlist.cover_image || `https://picsum.photos/400/400?${Math.random()}`
  const canEdit = playlist.creator.id === auth.user.id;


  const togglePublicStatus = async () => {
    setIsLoading(true);
    try {
      await playlistService.togglePublicStatus(playlist.id || "", !playlist.is_public);
      setPlaylist((prev) => {
        const updated = { ...prev, is_public: !prev.is_public };
        toast.success(`Playlist is now ${updated.is_public ? "public" : "private"}`);
        return updated;
      });
    } catch (error) {
      console.error('Error toggling playlist status:', error);
      toast.error('Failed to update playlist status');
    } finally {
      setIsLoading(false);
    }
  };

  const OnSuccess = (song: Song) => {
    setPlaylist((prev) => {
        const updated = { ...prev, songs: prev.songs ? [...prev.songs, song] : [song] }
        return updated
    })
  }

  const handlePlaylistUpdated = (updatedPlaylist: Playlist) => {
    setPlaylist(updatedPlaylist)
    toast.success("Playlist information updated!")
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <header className="p-6 pb-0">
        <Button variant="ghost" size="sm" asChild className="gap-1 hover:bg-accent/50">
          <a href="/">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </a>
        </Button>
      </header>

      <section className="p-6 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Cover Art */}
          <div className="relative group w-full max-w-[300px] aspect-square rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02]">
            <img
                src={image}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <Button
                size="icon"
                className="h-16 w-16 rounded-full shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Playlist Info */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="bg-accent/30 px-3 py-1 rounded-full">
                  {playlist.is_public ? "Public playlist" : "Private playlist"}
                </span>
                <span>•</span>
                <span>{playlist.songs?.length} songs</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                {playlist.name}
              </h1>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={playlist.creator.avatar}
                    alt={playlist.creator.name}
                    className="w-8 h-8 rounded-full ring-2 ring-border"
                  />
                  <span className="font-medium">{playlist.creator.name}</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <time className="text-muted-foreground">
                  Created {new Date(playlist.created_at || "").toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="gap-2 bg-primary/90 hover:bg-primary shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <div hidden={!canEdit} className="flex items-center gap-3 bg-accent/30 px-4 py-2 rounded-full">
                <Switch
                  checked={playlist.is_public}
                  onCheckedChange={togglePublicStatus}
                  id="public-toggle"
                  className="data-[state=checked]:bg-primary"
                  disabled={isLoading}
                />
                <label htmlFor="public-toggle" className="text-sm font-medium cursor-pointer">
                  {isLoading ? "Loading..." : playlist.is_public ? "Public" : "Private"}
                </label>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="hover:bg-accent/50">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent  align="end" className="w-48">
                  <PlaylistModal
                    playlist={playlist}
                    onSuccess={handlePlaylistUpdated}
                    trigger={
                      <DropdownMenuItem
                      hidden={!canEdit}
                        className="gap-3 cursor-pointer"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Playlist
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem  className="gap-3 cursor-pointer">
                    <Share2 className="h-4 w-4" />
                    Share Playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem  className="gap-3 cursor-pointer">
                    <Download className="h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem hidden={!canEdit} className="gap-3 cursor-pointer text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete Playlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-2" />

      <section className="p-6">
        <div className="mb-6">
          <AddSongToPlaylistModal playlist={playlist} onSongAdded={(song: Song) => OnSuccess(song)} />
        </div>

        <div className="space-y-3">
          {playlist.songs?.map((song, index) => (
            <MusicCard
              key={index}
              song={song}
            />
          ))}
        </div>
      </section>
    </AppLayout>
  )
}
