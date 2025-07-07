
import { AlbumCard } from '@/components/AlbumCard';
import { ArtistCard } from '@/components/ArtistCard';
import AppLayout from '@/layouts/app-layout';
import { Album, Artist, Gender,  Platform,  Song, type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Play, MoreHorizontal, CheckCircle, User, Music } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardData {
    best_albums: Album[];
    best_artists: Artist[];
    best_genres: Gender[];
    best_platforms: Platform[];
    most_played_song: Song;
    most_played_songs: Song[];
}

export default function Dashboard({data}: {data: DashboardData}) {


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 overflow-x-auto bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-background">

                {/* Featured Artist Section */}
                <div className=" flex-col lg:flex-row gap-6">
                    <div className="flex-1 mb-10">
                        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10">
                            <CardContent className="p-8">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    <div className="relative">
                                        <Avatar className="w-32 h-32 md:w-40 md:h-40">
                                            <AvatarImage src={data.most_played_song.cover_url} alt={data.most_played_song.artist?.name} />
                                            <AvatarFallback><User className="w-16 h-16" /></AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-2 -right-2">
                                            <Badge variant="secondary" className="bg-blue-600 text-white px-2 py-1 text-xs">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified Artist
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                                                {data.most_played_song.artist?.name}
                                            </h1>
                                            <p className="text-muted-foreground text-lg">
                                                {data.most_played_song.interactions?.length} plays
                                            </p>

                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8" >
                                                <Play className="w-5 h-5 mr-2" />
                                                PLAY
                                            </Button>
                                            <Button variant="outline" size="lg" className="px-8">
                                                FOLLOWING
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Popular Songs */}
                    <div className="w-full ">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Popular Songs</CardTitle>
                                <Link href="/music" className="text-sm text-muted-foreground hover:text-primary">See All</Link>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {data.most_played_songs.slice(0, 8).map((song: Song, index: number) => (
                                    <div key={song.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer group">
                                            <span className="w-6 text-center text-sm text-muted-foreground">{index + 1}</span>
                                        <div className="relative w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                                            {song.cover_url ? (
                                                <img src={song.cover_url} alt={`${song.title} cover`} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Music className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{song.title}</p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{song.duration} min</span>
                                        <span className="text-sm text-muted-foreground">{formatDate(song.created_at || '')}</span>
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Fans Also Like & Best Albums */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Fans Also Like */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Fans Also Like</CardTitle>
                            <Button variant="ghost" size="sm">See All</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                {data.best_artists.map((artist: Artist) => (
                                    <ArtistCard key={artist.id} {...artist} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Best Albums */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Best Albums</CardTitle>
                            <Button variant="ghost" size="sm">See All</Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                                {data.best_albums.map((album: Album) => (
                                    <AlbumCard key={album.id} {...album} />
                                ))}
                        </CardContent>
                    </Card>
                </div>


            </div>
        </AppLayout>
    );
}
