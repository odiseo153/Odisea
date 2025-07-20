import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, Music, User, Disc3, ListMusic } from "lucide-react"
import { MusicCard } from "@/components/Music/MusicCard"
import { PlaylistCard } from "@/components/PlaylistCard"
import { AlbumCard } from "@/components/AlbumCard"
import { ArtistCard } from "@/components/ArtistCard"
import { Song, Playlist, Album, Artist, BreadcrumbItem } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { MusicGrid } from "@/components/Music/MusicGrid"
import { CardGrid } from "@/components/CardGrid"


// Mock data - converted to proper types
const savedSongs: Song[] = [
    {
        id: "1",
        title: "Blinding Lights",
        is_favorite: true,
        duration: "200",
        cover_url: "/placeholder.svg?height=40&width=40",
        artist: { id: "1", name: "The Weeknd" },
        album: { id: "1", name: "After Hours" },
    },
    {
        id: "2",
        title: "Watermelon Sugar",
        is_favorite: true,
        duration: "174",
        cover_url: "/placeholder.svg?height=40&width=40",
        artist: { id: "2", name: "Harry Styles" },
        album: { id: "2", name: "Fine Line" },
    },
    {
        id: "3",
        title: "Levitating",
        is_favorite: true,
        duration: "203",
        cover_url: "/placeholder.svg?height=40&width=40",
        artist: { id: "3", name: "Dua Lipa" },
        album: { id: "3", name: "Future Nostalgia" },
    },
    {
        id: "4",
        title: "Good 4 U",
        is_favorite: true,
        duration: "178",
        cover_url: "/placeholder.svg?height=40&width=40",
        artist: { id: "4", name: "Olivia Rodrigo" },
        album: { id: "4", name: "SOUR" },
    },
    {
        id: "5",
        title: "Stay",
        is_favorite: true,
        duration: "141",
        cover_url: "/placeholder.svg?height=40&width=40",
        artist: { id: "5", name: "The Kid LAROI, Justin Bieber" },
        album: { id: "5", name: "F*CK LOVE 3" },
    },
]

const playlists: Playlist[] = [
    {
        id: "1",
        name: "Chill Vibes",
        is_public: true,
        cover_image: "/placeholder.svg?height=200&width=200",
        creator: { id: "1", name: "You", email: "user@example.com", email_verified_at: null, created_at: "", updated_at: "" },
        songs: Array(47).fill(null).map((_, i) => ({ id: `song-${i}`, title: `Song ${i}`, is_favorite: false })),
    },
    {
        id: "2",
        name: "Workout Mix",
        is_public: false,
        cover_image: "/placeholder.svg?height=200&width=200",
        creator: { id: "1", name: "You", email: "user@example.com", email_verified_at: null, created_at: "", updated_at: "" },
        songs: Array(32).fill(null).map((_, i) => ({ id: `song-${i}`, title: `Song ${i}`, is_favorite: false })),
    },
    {
        id: "3",
        name: "Road Trip",
        is_public: true,
        cover_image: "/placeholder.svg?height=200&width=200",
        creator: { id: "1", name: "You", email: "user@example.com", email_verified_at: null, created_at: "", updated_at: "" },
        songs: Array(28).fill(null).map((_, i) => ({ id: `song-${i}`, title: `Song ${i}`, is_favorite: false })),
    },
    {
        id: "4",
        name: "Late Night",
        is_public: false,
        cover_image: "/placeholder.svg?height=200&width=200",
        creator: { id: "1", name: "You", email: "user@example.com", email_verified_at: null, created_at: "", updated_at: "" },
        songs: Array(19).fill(null).map((_, i) => ({ id: `song-${i}`, title: `Song ${i}`, is_favorite: false })),
    },
]

const favoriteAlbums: Album[] = [
    { id: "1", name: "After Hours", artist: { id: "1", name: "The Weeknd" }, year: "2020", cover_url: "/placeholder.svg?height=200&width=200" },
    { id: "2", name: "Future Nostalgia", artist: { id: "3", name: "Dua Lipa" }, year: "2020", cover_url: "/placeholder.svg?height=200&width=200" },
    { id: "3", name: "Fine Line", artist: { id: "2", name: "Harry Styles" }, year: "2019", cover_url: "/placeholder.svg?height=200&width=200" },
    { id: "4", name: "SOUR", artist: { id: "4", name: "Olivia Rodrigo" }, year: "2021", cover_url: "/placeholder.svg?height=200&width=200" },
    { id: "5", name: "Positions", artist: { id: "6", name: "Ariana Grande" }, year: "2020", cover_url: "/placeholder.svg?height=200&width=200" },
    { id: "6", name: "folklore", artist: { id: "7", name: "Taylor Swift" }, year: "2020", cover_url: "/placeholder.svg?height=200&width=200" },
]

const favoriteArtists: Artist[] = [
    { id: "1", name: "The Weeknd", image_url: "/placeholder.svg?height=200&width=200", bio: "89.2M followers" },
    { id: "3", name: "Dua Lipa", image_url: "/placeholder.svg?height=200&width=200", bio: "87.6M followers" },
    { id: "2", name: "Harry Styles", image_url: "/placeholder.svg?height=200&width=200", bio: "65.8M followers" },
    { id: "4", name: "Olivia Rodrigo", image_url: "/placeholder.svg?height=200&width=200", bio: "45.3M followers" },
    { id: "6", name: "Ariana Grande", image_url: "/placeholder.svg?height=200&width=200", bio: "91.4M followers" },
    { id: "7", name: "Taylor Swift", image_url: "/placeholder.svg?height=200&width=200", bio: "94.1M followers" },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Favorites",
        href: "/favorites",
    },
];

interface Props {
    Songs: Song[],
    Playlists: Playlist[],
    Albums: Album[],
    Artists: Artist[],
}

export default function FavoritesPage({ data }: { data: Props }) {
    const [searchQuery, setSearchQuery] = useState("")

    console.log(data);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-primary rounded-full">
                            <Heart className="h-6 w-6 text-primary-foreground fill-current" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
                            <p className="text-muted-foreground">All your favorite music in one place</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search your library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="songs" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 mb-8">
                        <TabsTrigger value="songs" className="flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            <span className="hidden sm:inline">Songs</span>
                        </TabsTrigger>
                        <TabsTrigger value="playlists" className="flex items-center gap-2">
                            <ListMusic className="h-4 w-4" />
                            <span className="hidden sm:inline">Playlists</span>
                        </TabsTrigger>
                        <TabsTrigger value="albums" className="flex items-center gap-2">
                            <Disc3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Albums</span>
                        </TabsTrigger>
                        <TabsTrigger value="artists" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Artists</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Songs Tab */}
                    <TabsContent value="songs" className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-foreground">Liked Songs</h2>
                            <Badge variant="secondary">
                                {data.Songs.length} songs
                            </Badge>
                        </div>

                        <div className="space-y-2">
                            <MusicGrid tracks={data.Songs} />
                        </div>
                    </TabsContent>

                    {/* Playlists Tab */}
                    <TabsContent value="playlists" className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-foreground">Your Playlists</h2>
                            <Badge variant="secondary">
                                {data.Playlists.length} playlists
                            </Badge>
                        </div>
                        <CardGrid items={data.Playlists} type="Playlist" />
                    </TabsContent>

                    {/* Albums Tab */}
                    <TabsContent value="albums" className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-foreground">Favorite Albums</h2>
                            <Badge variant="secondary">
                                {favoriteAlbums.length} albums
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {favoriteAlbums.map((album) => (
                                <AlbumCard key={album.id} {...album} />
                            ))}
                        </div>
                    </TabsContent>

                    {/* Artists Tab */}
                    <TabsContent value="artists" className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-foreground">Favorite Artists</h2>
                            <Badge variant="secondary">
                                {favoriteArtists.length} artists
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {favoriteArtists.map((artist) => (
                                <ArtistCard key={artist.id} {...artist} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    )
}
