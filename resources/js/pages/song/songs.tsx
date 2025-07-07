import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { BreadcrumbItem, Song } from '@/types';
import AddSong from '@/components/Music/AddSong';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MusicGrid } from '@/components/Music/MusicGrid';
import { Pagination } from '@/components/ui/pagination';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Music',
        href: '/music',
    },
];

interface SongsProps {
    songs: {
        data: Song[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        title?: string;
        artist_name?: string;
    };
    sort: string;
}

export default function Songs({ songs, filters, sort }: SongsProps) {
    const { data, setData, get } = useForm({
        filter: filters,
        sort: sort,
        per_page: songs.per_page
    });

    const handleSearch = (field: keyof typeof data.filter, value: string) => {
        const newFilters = { ...data.filter };
        if (value === '') {
            delete newFilters[field];
        } else {
            newFilters[field] = value as any;
        }

        setData('filter', newFilters);
        get(route('music.index'), {
            only: ['songs']
        });
    };

    const handleSort = (value: string) => {
        setData('sort', value);
        get(route('music.index'), {
            only: ['songs']
        });
    };

    const handlePageChange = (page: number) => {
        get(route('music.index', { page }), {
            only: ['songs']
        });
    };

    const handlePerPageChange = (perPage: number) => {
        setData('per_page', perPage);
        get(route('music.index'), {
            only: ['songs']
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Music" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Discover Music</h1>
                        <p className="text-muted-foreground">Discover music from multiple platforms</p>
                    </div>
                    <AddSong />
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Search by song title..."
                        value={data.filter.title || ''}
                        onChange={(e) => handleSearch('title', e.target.value)}
                        className="max-w-sm"
                    />
                    <Input
                        placeholder="Search by artist name..."
                        value={data.filter.artist_name || ''}
                        onChange={(e) => handleSearch('artist_name', e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={data.sort} onValueChange={handleSort}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="title">Title (A-Z)</SelectItem>
                            <SelectItem value="-title">Title (Z-A)</SelectItem>
                            <SelectItem value="-created_at">Newest First</SelectItem>
                            <SelectItem value="created_at">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Songs Grid */}
                <MusicGrid tracks={songs.data} />

                {/* Pagination */}
                <Pagination
                    currentPage={songs.current_page}
                    lastPage={songs.last_page}
                    perPage={songs.per_page}
                    total={songs.total}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
        </AppLayout>
    );
};
