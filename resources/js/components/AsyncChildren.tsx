import { NavItem } from '@/types';
import { useState, useEffect } from 'react';

interface AsyncChildrenProps {
    getChildren: () => Promise<NavItem[]>;
    page?: string;
}

export default function AsyncChildren({ getChildren }: AsyncChildrenProps) {
    const [children, setChildren] = useState<NavItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadChildren = async () => {
            try {
                const items = await getChildren();
                setChildren(items);
            } catch (error) {
                console.error('Error loading children:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChildren();
    }, [getChildren]);



    if (loading) {
        return <div className="p-2">Loading...</div>;
    }

    return (
        <div>
            {children.map((child, index) => (
                <div key={index} className="pl-4">
                    {child.title}
                </div>
            ))}
        </div>
    );
}
