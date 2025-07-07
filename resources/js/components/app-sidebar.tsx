import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Album, Heart, Home, List, Music, Music2, Users, Wifi } from 'lucide-react';
import PlayerBar from './player-bar';
import AppLogoIcon from './app-logo-icon';
import { Link } from '@inertiajs/react';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/dashboard',
        icon: Home,
    },
    {
        title: 'Music',
        href: '/music',
        icon: Music2,
    },
    {
        title: 'Playlists',
        href: '/playlists',
        icon: List
    },
    {
        title: 'Albums',
        href: '/albums',
        icon: Album,
    },
    {
        title: 'Artists',
        href: '/artists',
        icon: Users,
    },
/*
{
    title: 'Offline Musics',
    href: '/offline-musics',
    icon: Music,
},
{
    title: 'Favorites',
    href: '/favorites',
    icon: Heart,
},
*/
    {
        title: 'WebSocket Test',
        href: '/websocket-test',
        icon: Wifi,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <AppLogoIcon className="w-30 h-30 rounded-full mx-auto" />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                    <NavUser />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                    <PlayerBar />
            </SidebarFooter>
        </Sidebar>
    );
}
