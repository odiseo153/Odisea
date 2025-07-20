import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | string;
    children?: NavItem[] | (() => Promise<NavItem[]>);
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
}

export interface User {
    id?: string;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;

    playlists?: Playlist[];
    favoriteSongs?: Song[];
    favoritePlaylists?: Playlist[];
    songs?: Song[];
    artists?: Artist[];
    albums?: Album[];
    interactions?: Album[];
}

export interface Song {
    id: string;
    title: string;
    is_favorite: boolean;
    duration?: string;
    cover_url?: string;
    platform?: Platform;
    artist?: Artist;
    album?: Album;
    genders?: Gender[];
    added_by?: User;
    download?: Download;
    other_songs?: Song[];
    created_at?: string;
    play_count?: number;
    interactions?: Interaction[];
}

export interface Artist {
    id: string;
    name: string;
    image_url?: string;
    bio?: string;
    albums?: Album[];
    songs?: Song[];
    total_plays?: number;
    interactions?: Interaction[];
}

export interface Interaction {
    id: number;
    user?: User;
    song?: Song;
    liked?: boolean;
    play_count?: number;
    last_played_at?: string;
}

export interface Gender {
    id: string;
    name: string;
    songs?: Song[];
}

export interface Album {
    id: string;
    name: string;
    year?: string;
    cover_url?: string;
    artist?: Artist;
    owner?: User;
    songs?: Song[];
}

export interface Platform {
    id: string;
    name: string;
    logo_url?: string;
    url?: string;
}

export interface Playlist {
    id?: string;
    name: string;
    is_public?: boolean;
    cover_image?: string;
    cover_image_url?: string;
    user_id?: string;
    creator: User;
    songs?: Song[];
    created_at?: string;
    is_favorite?: boolean;
}

export interface Download {
    id: string;
    file_path: string;
    user: User;
    song: Song;
    created_at: string;
}


export interface JsonApiLinks {
    self: string;
    next?: string;
    last?: string;
}

export interface JsonApiRelationshipLinks {
    self: string;
    related: string;
}

export interface JsonApiRelationshipData {
    type: string;
    id: string;
}

export interface JsonApiResource<T> {
    id: string;
    attributes: T;
    relationships?: {
        [key: string]: {
            links?: JsonApiRelationshipLinks;
            data: JsonApiRelationshipData | JsonApiRelationshipData[];
        }
    };
    links?: {
        self: string;
    };
}

export interface JsonApiResponse<T> {
    links: JsonApiLinks;
    data: T[];
    included?: JsonApiResource<T>[];
}
