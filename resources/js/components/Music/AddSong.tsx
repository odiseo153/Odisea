import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Artist, Platform } from '@/types';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { songService } from '@/services/songService';
import { platformService } from '@/services/platformService';
import { artistService } from '@/services/artistService';
import { X, Upload } from 'lucide-react';
import { Select, Avatar } from 'antd';

const initialSongData = {
    title: '',
    artist_id: '',
    platform_id: '',
    cover_url: '',
    duration: 0,
    file_path: '',
};

export default function AddSong() {
    const [isOpen, setIsOpen] = useState(false);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [songData, setSongData] = useState(initialSongData);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageType, setImageType] = useState<'url' | 'file'>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioFileRef = useRef<HTMLInputElement>(null);
    const { auth } = usePage<SharedData>().props;


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [platformsData, artistsData] = await Promise.all([
                    platformService.getAllPlatforms(),
                    artistService.getAllArtists()
                ]);

                setPlatforms(platformsData.data);
                setArtists(artistsData.artists);
            } catch (err) {
                console.error('Error fetching data:', err);
                toast.error('Failed to load required data');
            }
        };

        if (isOpen) fetchData();
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSongData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setSongData(initialSongData);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (audioFileRef.current) audioFileRef.current.value = '';
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setSongData(prev => ({ ...prev, cover_url: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUrlChange = (url: string) => {
        setSongData(prev => ({ ...prev, cover_url: url }));
        setImagePreview(url);
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setSongData(prev => ({ ...prev, cover_url: result }));
                setImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            const audio = new Audio(URL.createObjectURL(file));

            audio.onloadedmetadata = () => {
                setSongData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
                URL.revokeObjectURL(audio.src);
            };

            reader.onloadend = () => {
                setSongData(prev => ({ ...prev, file_path: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectChange = (field: string) => (value: string) => {
        setSongData(prev => ({ ...prev, [field]: value }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!songData.title || !songData.artist_id || !songData.file_path || !songData.platform_id) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const formData = new FormData();
            Object.entries(songData).forEach(([key, value]) => {
                formData.append(key, String(value));
            });

            await songService.createSong(auth.user.id as string, formData);
            toast.success('Song added successfully!');
            resetForm();
            setIsOpen(false);
        } catch (error) {
            console.error('Error adding song:', error);
            toast.error('Failed to add song');
        }
    };

    // Custom option renderer for artists with images
    const renderArtistOption = (artist: Artist) => ({
        value: artist.id,
        label: (
            <div className="flex items-center gap-2">
                <Avatar
                    size={24}
                    src={artist.image_url}
                    style={{ backgroundColor: '#f0f0f0' }}
                >
                    {artist.name.charAt(0).toUpperCase()}
                </Avatar>
                <span>{artist.name}</span>
            </div>
        ),
    });

    // Custom option renderer for platforms with images
    const renderPlatformOption = (platform: Platform) => ({
        value: platform.id,
        label: (
            <div className="flex items-center gap-2">
                <Avatar
                    size={24}
                    src={platform.logo_url}
                    style={{ backgroundColor: '#f0f0f0' }}
                >
                    {platform.name.charAt(0).toUpperCase()}
                </Avatar>
                <span>{platform.name}</span>
            </div>
        ),
    });

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Add Song</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Song</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Song Title</Label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            value={songData.title}
                            onChange={handleInputChange}
                            placeholder="Enter song title"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="artist">Artist</Label>
                        <Select
                            showSearch
                            placeholder="Select an artist"
                            optionFilterProp="children"
                            onChange={handleSelectChange('artist_id')}
                            filterOption={(input, option) =>
                                (option?.label as any)?.props?.children?.[1]?.props?.children
                                    ?.toLowerCase()
                                    ?.includes(input.toLowerCase()) ?? false
                            }
                            options={artists.map(renderArtistOption)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <Label htmlFor="platform">Platform</Label>
                        <Select
                            showSearch
                            placeholder="Select a platform"
                            optionFilterProp="children"
                            onChange={handleSelectChange('platform_id')}
                            filterOption={(input, option) =>
                                (option?.label as any)?.props?.children?.[1]?.props?.children
                                    ?.toLowerCase()
                                    ?.includes(input.toLowerCase()) ?? false
                            }
                            options={platforms.map(renderPlatformOption)}
                            style={{ width: '100%' }}
                        />
                    </div>

                    <div>
                        <Label htmlFor="song-file">Song File</Label>
                        <Input
                            type="file"
                            id="song-file"
                            ref={audioFileRef}
                            accept="audio/*"
                            onChange={handleAudioFileChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="duration">Duration (Optional)</Label>
                        <Input
                            type="text"
                            id="duration"
                            name="duration"
                            value={songData.duration}
                            onChange={handleInputChange}
                            placeholder="Enter song duration (e.g., 3:45)"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Cover Image</Label>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                    onClick={handleRemoveImage}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={imageType === 'url' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setImageType('url')}
                                >
                                    URL
                                </Button>
                                <Button
                                    type="button"
                                    variant={imageType === 'file' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setImageType('file')}
                                >
                                    Upload File
                                </Button>
                            </div>

                            {imageType === 'url' ? (
                                <Input
                                    type="url"
                                    name="cover_url"
                                    value={songData.cover_url}
                                    onChange={(e) => handleUrlChange(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            ref={fileInputRef}
                                            accept=".jpg,.jpeg,.png"
                                            onChange={handleImageFileChange}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Choose Image
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Supports JPG, JPEG, PNG. Max 5MB.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <Button type="submit" className="w-full">
                        Add Song
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}


