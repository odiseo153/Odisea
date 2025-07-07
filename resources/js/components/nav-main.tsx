import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Button } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import AsyncChildren from './AsyncChildren';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: boolean}>({});

    const toggleDropdown = (title: string) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <div className="flex flex-col">
                            <div className="flex items-center w-full">
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(item.href)}
                                    tooltip={{ children: item.title }}
                                    className="flex-grow"
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                                {item.children && (
                                    <Button
                                        onClick={() => toggleDropdown(item.title)}
                                        className="p-2 hover:bg-accent rounded-md"
                                    >
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${openDropdowns[item.title] ? 'transform rotate-180' : ''}`}
                                        />
                                    </Button>
                                )}
                            </div>
                            {item.children && openDropdowns[item.title] && (
                                <SidebarMenu className="ml-4 mt-1">
                                    {typeof item.children === 'function' ? (
                                        // Handle async children
                                        <AsyncChildren
                                            getChildren={item.children}
                                            page={page}
                                        />
                                    ) : (
                                        // Handle static children array
                                        item.children.map((child: NavItem) => (
                                            <SidebarMenuItem key={child.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={page.url.startsWith(child.href)}
                                                    tooltip={{ children: child.title }}
                                                >
                                                    <Link href={child.href} prefetch>
                                                        {child.icon && typeof child.icon === 'string' ? (
                                                            <img src={child.icon} className="w-5 h-5" alt="" />
                                                        ) : child.icon && (
                                                            <child.icon />
                                                        )}
                                                        <span>{child.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))
                                    )}
                                </SidebarMenu>
                            )}
                        </div>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
