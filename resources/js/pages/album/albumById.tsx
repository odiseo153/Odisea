"use client"

import * as React from "react"
import {
    Play,
    Pause,
    Heart,
    MoreHorizontal,
    Clock,
    Share2,
    Download,
    Plus,
    ChevronLeft,
    Calendar,
    Music,
    User,
    ExternalLink,
} from "lucide-react"
import { Head, Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import AppLayout from "@/layouts/app-layout"
import { Album, BreadcrumbItem, Song } from "@/types"
import { AddSongToAlbumModal } from '@/components/Album'


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Albums',
        href: '/albums',
    },
]

export default function AlbumPage({ album }: { album: Album }) {
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [currentTrack, setCurrentTrack] = React.useState<number | null>(null)

    // Function to play a specific track
    const playTrack = (trackId: number) => {
        setCurrentTrack(trackId)
        setIsPlaying(true)
    }



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Album" />
            {/* Back button */}
            <div className="p-6 pb-0">
                <Button variant="ghost" size="sm" asChild className="gap-1">
                    <Link href="/albums">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Albums
                    </Link>
                </Button>
            </div>

            {/* Album header */}
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Album cover */}
                    <div className="relative group w-full max-w-[300px] aspect-square rounded-lg overflow-hidden shadow-2xl">
                        <img
                            src={album.cover_url || "/placeholder.svg"}
                            alt={album.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">

                        </div>
                    </div>

                    {/* Album info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>Album</span>
                            <span>•</span>
                            <span>{album.songs?.length} songs</span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold mb-4">{album.name}</h1>

                        <div className="flex items-center gap-3 mb-4">
                            <Link href={`/artists/${album.artist?.id}`} className="flex items-center gap-2 hover:underline">
                                <img
                                    src={album.artist?.image_url || "/placeholder.svg"}
                                    alt={album.artist?.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="font-semibold text-lg">{album.artist?.name}</span>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Released {album.year}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Music className="h-4 w-4" />
                                <span>{album.songs?.length} songs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{album.artist?.name}</span>
                            </div>
                        </div>
                        {album.artist?.bio && (
                            <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">{album.artist?.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" className="gap-2">
                                <Heart className="h-4 w-4" />
                                Save
                            </Button>

                            <AddSongToAlbumModal
                                album={album}
                                onSongAdded={() => window.location.reload()}
                            />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share Album
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add to Playlist
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Open in Spotify
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Songs table */}
            <div className="p-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="text-right">
                                <Clock className="h-4 w-4 ml-auto" />
                            </TableHead>
                            <TableHead className="w-10"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {album.songs?.map((song) => (
                            <TableRow
                                key={song.id}
                                className={`group hover:bg-accent/50 ${currentTrack === parseInt(song.id) ? "bg-accent/30" : ""}`}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center justify-center w-6 h-6 group-hover:hidden">
                                        {currentTrack === parseInt(song.id) && isPlaying ? (
                                            <div className="flex items-center justify-center">
                                                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                                            </div>
                                        ) : (
                                            song.interactions?.find((interaction) => interaction.song?.id === song.id)?.play_count
                                        )}
                                    </div>
                                    <div className="hidden group-hover:flex items-center justify-center w-6 h-6">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={() => playTrack(parseInt(song.id))}>
                                            {currentTrack === parseInt(song.id) && isPlaying ? (
                                                <Pause className="h-3 w-3" />
                                            ) : (
                                                <Play className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <div className={`font-medium ${currentTrack === parseInt(song.id) ? "text-primary" : ""}`}>
                                                {song.title}
                                            </div>
                                            <div className="flex items-center gap-2">

                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{song.duration}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                        >
                                            <Heart className={`h-4 w-4`} />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add to playlist
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Share song
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Open in Spotify
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Album stats */}
            <div className="p-6">
                <Separator className="mb-6" />
                <div className="text-sm text-muted-foreground">
                    <p>
                        © {album.year} {album.artist?.name}
                    </p>
                    {album.songs?.length && (
                        <p className="mt-1">
                            {album.year} • {album.songs?.length} songs, {(album.songs as Song[]).reduce((acc, song) => acc + parseInt(song.duration || "0"), 0)}
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}
