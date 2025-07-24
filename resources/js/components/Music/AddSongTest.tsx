import React from 'react';
import AddSong from './AddSong';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AddSongTest() {
    const handleSuccess = () => {
        console.log('Song added successfully!');
        // You can add any additional logic here, like refreshing a list
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Add Song Modal Test</h2>
            
            {/* Default trigger */}
            <div className="mb-4">
                <AddSong onSuccess={handleSuccess} />
            </div>

            {/* Custom trigger */}
            <div className="mb-4">
                <AddSong 
                    trigger={
                        <Button variant="outline" size="lg">
                            <Plus className="mr-2 h-4 w-4" />
                            Custom Add Song Button
                        </Button>
                    }
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
}