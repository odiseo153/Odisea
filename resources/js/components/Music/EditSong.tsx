import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Artist, Platform } from '@/types';
import { AvatarFallback, Avatar, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { songService } from '@/services/songService';
import { platformService } from '@/services/platformService';
import { artistService } from '@/services/artistService';
import { X } from 'lucide-react';
import { Upload } from 'lucide-react';
import { Song } from "@/types"

export default function EditSong({ song }: { song: Song }) {
    const [isOpen, setIsOpen] = useState(false);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const { auth } = usePage<SharedData>().props;
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(song.cover_url || null);
    const [imageType, setImageType] = useState<'url' | 'file'>(song.cover_url ? 'url' : 'file');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize form state with song data
    const [songData, setSongData] = useState({
        title: song.title || '',
        artist_id: song.artist_id || '',
        album_id: song.album_id || '',
        platform_id: song.platform_id || '',
        cover_url: song.cover_url || '',
        duration: song.duration || 0,
        file_path: song.file_path || '',
    });

    useEffect(() => {
        // When dialog opens, reset form to song prop
        if (isOpen) {
            setSongData({
                title: song.title || '',
                artist_id: song.artist_id || '',
                album_id: song.album_id || '',
                platform_id: song.platform_id || '',
                cover_url: song.cover_url || '',
                duration: song.duration || 0,
                file_path: song.file_path || '',
            });
            setImagePreview(song.cover_url || null);
            setImageType(song.cover_url ? 'url' : 'file');
            setImageFile(null);
        }
    }, [isOpen, song]);

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
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSongData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setSongData({ ...songData, cover_url: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUrlChange = (url: string) => {
        setSongData({ ...songData, cover_url: url });
        setImagePreview(url);
    };

    // Handles both audio and image file uploads
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (e.target.accept?.includes('audio')) {
            // Audio file
            const audioElement = new Audio(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.onloadend = () => {
                setSongData(prev => ({
                    ...prev,
                    file_path: reader.result as string,
                    // duration will be set after audio loads
                }));
                audioElement.onloadedmetadata = () => {
                    setSongData(prev => ({
                        ...prev,
                        duration: audioElement.duration
                    }));
                };
            };
            reader.readAsDataURL(file);
        } else {
            // Image file
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setSongData(prev => ({
                    ...prev,
                    cover_url: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePlatformSelect = (value: string) => {
        setSongData(prev => ({
            ...prev,
            platform_id: value
        }));
    };

    const handleArtistSelect = (value: string) => {
        setSongData(prev => ({
            ...prev,
            artist_id: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Validate required fields
            if (!songData?.title || !songData?.artist_id || !songData?.platform_id) {
                toast.error('Please fill in all required fields');
                return;
            }

            // Prepare form data for submission
            const formData = new FormData();
            Object.entries(songData).forEach(([key, value]) => {
                // Only append if value is not undefined or null
                if (value !== undefined && value !== null) {
                    formData.append(key, value as string);
                }
            });

            // If imageFile is present and imageType is 'file', append it
            if (imageFile && imageType === 'file') {
                formData.set('cover_url', ''); // clear url
                formData.append('cover_image', imageFile);
            }

            // If file_path is a file (audio), it should already be in songData.file_path as base64

            // Call update endpoint
           const response = await songService.updateSong(song.id, songData);

           console.log(response,songData);
            toast.success('Song updated successfully!');

            setIsOpen(false);
        } catch (error) {
            console.error('Error updating song:', error);
            toast.error('Failed to update song');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Song</DialogTitle>
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
                            onValueChange={handleArtistSelect}
                            value={songData.artist_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an artist" />
                            </SelectTrigger>
                            <SelectContent>
                                {artists.map((artist) => (
                                    <SelectItem key={artist.id} value={artist.id}>
                                        {artist.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="album">Album (Optional)</Label>
                        <Input
                            type="text"
                            id="album"
                            name="album_id"
                            value={songData.album_id}
                            onChange={handleInputChange}
                            placeholder="Enter album name"
                        />
                    </div>

                    <div>
                        <Label htmlFor="platform">Platform</Label>
                        <Select
                            onValueChange={handlePlatformSelect}
                            value={songData.platform_id}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                            <SelectContent>
                                {platforms.map((platform) => (
                                    <SelectItem key={platform.id} value={platform.id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                                                <AvatarImage src={platform?.logo_url} alt={platform.name} />
                                                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    {platform.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{platform.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="song-file">Song File</Label>
                        <Input
                            type="file"
                            id="song-file"
                            accept="audio/*"
                            name="file_path"
                            onChange={handleFileChange}
                        />
                        {songData.file_path && typeof songData.file_path === 'string' && (
                            <div className="text-xs text-muted-foreground mt-1">
                                Current file: {songData.file_path.length > 30 ? songData.file_path.slice(0, 30) + '...' : songData.file_path}
                            </div>
                        )}
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
                                            onChange={handleFileChange}
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
                                            {imageFile ? imageFile.name : "Choose Image"}
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
                        Save Changes
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
