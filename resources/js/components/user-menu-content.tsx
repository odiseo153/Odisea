import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Button } from '@headlessui/react';
import { Link, useForm } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { useState } from 'react';
import { route } from 'ziggy-js';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { post } = useForm();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Main logout function - uses API logout
    const handleLogout = async () => {
        setIsLoggingOut(true);
        console.log("Starting API logout process...");
        console.log("Current token:", authService.getToken());
        
        try {
            await authService.logout();
            console.log("API logout successful");
            console.log("Token after logout:", authService.getToken());
            
            toast.success("Logged out successfully");
            // Redirect to login page
           // window.location.href = '/login';
        } catch (error) {
            console.error("API logout failed:", error);
            toast.error("Logout failed");
        } finally {
            setIsLoggingOut(false);
        }
    };

    // Keep the old web logout for comparison/testing
    const handleWebLogout = () => {
        console.log("Starting web logout process...");
        console.log("Logout route:", route('logout'));
        
        post(route('logout'), {
            onBefore: () => {
                console.log("About to send logout request");
                return true;
            },
            onStart: () => {
                console.log("Logout request started");
            },
            onProgress: (progress) => {
                console.log("Logout progress:", progress);
            },
            onSuccess: (page) => {
                console.log("Logout successful", page);
            },
            onError: (errors) => {
                console.error("Logout failed with errors:", errors);
            },
            onFinish: () => {
                console.log("Logout request completed");
            }
        });
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Button 
                    className="block w-full" 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    <LogOut className="mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                </Button>
            </DropdownMenuItem>
            
            {/* Optional: Add Web Logout for testing */}
            <DropdownMenuItem asChild>
                <Button className="block w-full text-xs opacity-60" onClick={handleWebLogout}>
                    Web Logout (Test)
                </Button>
            </DropdownMenuItem>
        </>
    );
}
