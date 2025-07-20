"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Head } from "@inertiajs/react"
import { useForm } from '@inertiajs/react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BreadcrumbItem, Playlist } from "@/types"
import AppLayout from "@/layouts/app-layout"
import { PlaylistModal } from "@/components/Playlist/PlaylistModal"
import { CardGrid } from '@/components/CardGrid'
import { Pagination } from '@/components/ui/pagination'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Playlists',
    href: '/playlists',
  },
]



interface PlaylistsProps {
    playlists: {
        data: Playlist[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        name?: string;
        creator_name?: string;
        is_public?: string;
        user_id?: string;
    };
    sort: string;
}

export default function Playlists({ playlists, filters, sort }: PlaylistsProps) {
    
    console.log(playlists);
    const { data, setData, get } = useForm({
        filter: filters,
        sort: sort,
        per_page: playlists.per_page
    });
        const handleSearch = (field: keyof typeof data.filter, value: string | boolean | null) => {
        const newFilters = { ...data.filter };
        if (value === null || value === '') {
            delete newFilters[field];
        } else {
            newFilters[field] = value as any;
        }

        setData('filter', newFilters);
        get(route('playlists.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['playlists']
        });
    };

    const handleSort = (value: string) => {
        setData('sort', value);
        get(route('playlists.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['playlists']
        });
    };

    const handlePageChange = (page: number) => {
        get(route('playlists.index', { page }), {
            preserveState: true,
            preserveScroll: true,
            only: ['playlists']
        });
    };

    const handlePerPageChange = (perPage: number) => {
        setData('per_page', perPage);
        get(route('playlists.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['playlists']
        });
    };

    const handlePlaylistCreated = () => {
        get(route('playlists.index'), {
            preserveState: true,
            preserveScroll: true,
            only: ['playlists']
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Playlists" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Playlists</h1>
                    <PlaylistModal
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Playlist
                            </Button>
                        }
                        onSuccess={handlePlaylistCreated}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search by playlist name..."
                        value={data.filter.name || ''}
                        onChange={(e) => handleSearch('name', e.target.value)}
                        className="max-w-sm"
                    />
                    <Input
                        placeholder="Search by creator name..."
                        value={data.filter.creator_name || ''}
                        onChange={(e) => handleSearch('creator_name', e.target.value)}
                        className="max-w-sm"
                    />
                    <Select
                        value={data.filter.is_public || 'all'}
                        onValueChange={(value) => handleSearch('is_public', value === 'all' ? null : value)}
                    >
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Visibility..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="true">Public</SelectItem>
                            <SelectItem value="false">Private</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={data.sort} onValueChange={handleSort}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name (A-Z)</SelectItem>
                            <SelectItem value="-name">Name (Z-A)</SelectItem>
                            <SelectItem value="creator_name">Creator (A-Z)</SelectItem>
                            <SelectItem value="-creator_name">Creator (Z-A)</SelectItem>
                            <SelectItem value="-created_at">Newest First</SelectItem>
                            <SelectItem value="created_at">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <CardGrid items={playlists.data} type="Playlist" />

                <Pagination
                    currentPage={playlists.current_page}
                    lastPage={playlists.last_page}
                    perPage={playlists.per_page}
                    total={playlists.total}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
        </AppLayout>
    );
}
