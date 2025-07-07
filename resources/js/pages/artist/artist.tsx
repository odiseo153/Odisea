"use client"

import * as React from "react"
import { Users, Verified } from "lucide-react"
import { Head, Link } from "@inertiajs/react"
import { useForm } from '@inertiajs/react'

import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import AppLayout from "@/layouts/app-layout"
import { BreadcrumbItem, Artist } from "@/types"
import { CardGrid } from '@/components/CardGrid'
import { Pagination } from '@/components/ui/pagination'


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Artist',
        href: '/artist',
    },
];

function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artist/${artist.id}`}>
      <Card className="group cursor-pointer transition-all duration-300 hover:bg-accent/50 hover:shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="relative mb-4">
            <img
              src={artist.image || "/placeholder.svg"}
              alt={artist.name}
              className="w-full aspect-square object-cover rounded-full shadow-md transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1">
              <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{artist.name}</h3>
            </div>

            <p className="text-muted-foreground text-sm">Artist</p>

            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{artist.albums?.length || 0} albums</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface ArtistsProps {
    artists: {
        data: Artist[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        name?: string;
        album_name?: string;
        song_title?: string;
    };
    sort: string;
}

export default function Artists({ artists, filters, sort }: ArtistsProps) {
    const { data, setData, get } = useForm({
        filter: filters,
        sort: sort,
        per_page: artists.per_page
    });

    const handleSearch = (field: keyof typeof data.filter, value: string) => {
        const newFilters = { ...data.filter };
        if (value === '') {
            delete newFilters[field];
        } else {
            newFilters[field] = value as any;
        }

        setData('filter', newFilters);
        get(route('artists.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['artists']
        });
    };

    const handleSort = (value: string) => {
        setData('sort', value);
        get(route('artists.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['artists']
        });
    };

    const handlePageChange = (page: number) => {
        get(route('artists.index', { page }), {
            preserveState: true,
            preserveScroll: true,
            only: ['artists']
        });
    };

    const handlePerPageChange = (perPage: number) => {
        setData('per_page', perPage);
        get(route('artists.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['artists']
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Artists" />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search by artist name..."
                        value={data.filter.name || ''}
                        onChange={(e) => handleSearch('name', e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={data.sort} onValueChange={handleSort}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name (A-Z)</SelectItem>
                            <SelectItem value="-name">Name (Z-A)</SelectItem>
                            <SelectItem value="-created_at">Newest First</SelectItem>
                            <SelectItem value="created_at">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <CardGrid items={artists.data} type="Artist" />

                <Pagination
                    currentPage={artists.current_page}
                    lastPage={artists.last_page}
                    perPage={artists.per_page}
                    total={artists.total}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
        </AppLayout>
    );
}
