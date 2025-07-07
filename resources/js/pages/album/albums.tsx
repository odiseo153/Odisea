"use client"

import * as React from "react"
import { Search, Music, Play, Calendar, Filter } from "lucide-react"
import { Head, Link } from "@inertiajs/react"
import { useForm } from '@inertiajs/react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Album, BreadcrumbItem } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { CardGrid } from '@/components/CardGrid';
import { Pagination } from '@/components/ui/pagination';
import { AlbumModal } from '@/components/Album';


const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Albums',
    href: '/albums',
  },
]

function AlbumCard({ album }: { album: Album }) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <Link href={`/album/${album.id}`}>
      <Card
        className="group cursor-pointer transition-all duration-300 hover:bg-accent/50 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          <div className="relative mb-4">
            <img
              src={album.cover_url || "/placeholder.svg"}
              alt={album.name}
              className="w-full aspect-square object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
            />
            <div
              className={`absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
                <Play className="h-6 w-6 ml-1" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{album.name}</h3>
            <p className="text-muted-foreground truncate">{album.artist?.name}</p>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{album.year}</span>
              </div>
              <div className="flex items-center gap-1">
                <Music className="h-3 w-3" />
                <span>{album.songs?.length} tracks</span>
              </div>
            </div>

            <Badge variant="secondary" className="text-xs">
              {album.songs?.map((song) => song.genders?.map((gender) => gender.name).join(", ")).join(", ")}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface AlbumsProps {
    albums: {
        data: Album[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        name?: string;
        artist_name?: string;
        song_title?: string;
        artist_id?: string;
    };
    sort: string;
}

export default function Albums({ albums, filters, sort }: AlbumsProps) {
    const { data, setData, get } = useForm({
        filter: filters,
        sort: sort,
        per_page: albums.per_page
    });

    const handleSearch = (field: keyof typeof data.filter, value: string) => {
        const newFilters = { ...data.filter };
        if (value === '' || value === 'all') {
            delete newFilters[field];
        } else {
            newFilters[field] = value as any;
        }

        setData('filter', newFilters);
        get(route('albums.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['albums']
        });
    };

    const handleSort = (value: string) => {
        setData('sort', value);
        get(route('albums.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['albums']
        });
    };

    const handlePageChange = (page: number) => {
        get(route('albums.index', { page }), {
            preserveState: true,
            preserveScroll: true,
            only: ['albums']
        });
    };

    const handlePerPageChange = (perPage: number) => {
        setData('per_page', perPage);
        get(route('albums.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['albums']
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Albums" />
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Albums</h1>
                    <p className="text-muted-foreground">Discover and explore music albums</p>
                </div>
                <AlbumModal onSuccess={() => window.location.reload()} />
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search albums, artists, or genres..."
                            value={data.filter.name || ''}
                            onChange={(e) => handleSearch('name', e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3">
                        <Select value={data.filter.artist_name || 'all'} onValueChange={(value) => handleSearch('artist_name', value === 'all' ? '' : value)}>
                            <SelectTrigger className="w-[140px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Artist" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Artists</SelectItem>
                                {/* Add artist options here */}
                            </SelectContent>
                        </Select>

                        <Select value={data.sort} onValueChange={handleSort}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name (A-Z)</SelectItem>
                                <SelectItem value="-name">Name (Z-A)</SelectItem>
                                <SelectItem value="artist_name">Artist (A-Z)</SelectItem>
                                <SelectItem value="-artist_name">Artist (Z-A)</SelectItem>
                                <SelectItem value="-created_at">Newest First</SelectItem>
                                <SelectItem value="created_at">Oldest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-muted-foreground">
                    {albums.data.length} album{albums.data.length !== 1 ? "s" : ""} found
                </div>
            </div>

            {/* Albums Grid */}
            <CardGrid items={albums.data} type="Album" />

            <Pagination
                currentPage={albums.current_page}
                lastPage={albums.last_page}
                perPage={albums.per_page}
                total={albums.total}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
            />
        </AppLayout>
    )
}
