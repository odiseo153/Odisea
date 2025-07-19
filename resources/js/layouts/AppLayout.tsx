import { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import PlayerBar from '@/components/player-bar';
import { usePlayer } from '@/contexts/PlayerContext';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const { currentSong } = usePlayer();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                
                <SidebarInset className="flex-1 flex flex-col">
                    {/* Main content area */}
                    <div 
                        className={`flex-1 overflow-auto ${
                            currentSong ? 'pb-16 md:pb-24' : 'pb-0'
                        }`}
                    >
                        {children}
                    </div>
                </SidebarInset>
            </div>

            {/* PlayerBar independiente - siempre visible cuando hay canción */}
            <PlayerBar />
        </SidebarProvider>
    );
}