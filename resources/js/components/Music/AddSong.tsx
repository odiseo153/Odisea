import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Artist, Platform } from '@/types';
import { usePage } from '@inertiajs/react';
import { songService } from '@/services/songService';
import { platformService } from '@/services/platformService';
import { artistService } from '@/services/artistService';
import { X, Upload, Music, Image, Clock, User, Disc, FileAudio, Loader2 } from 'lucide-react';

const initialSongData = {
    title: '',
    artist_id: '',
    platform_id: '',
    cover_url: '',
    duration: 0,
    file_path: '',
};

interface AddSongProps {
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export default function AddSong({ trigger, onSuccess }: AddSongProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [songData, setSongData] = useState(initialSongData);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageType, setImageType] = useState<'url' | 'file'>('url');
    const [audioFileName, setAudioFileName] = useState<string>('');
    const [audioDuration, setAudioDuration] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioFileRef = useRef<HTMLInputElement>(null);
    const { auth } = usePage().props as any;


    useEffect(() => {
        const fetchData = async () => {
            if (!isOpen) return;

            setIsLoading(true);
            try {
                const [platformsData, artistsData] = await Promise.all([
                    platformService.getAllPlatforms(),
                    artistService.getAllArtists()
                ]);

                setPlatforms(platformsData.data || []);
                setArtists(artistsData.artists || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                toast.error('Failed to load required data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
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
        setAudioFileName('');
        setAudioDuration('');
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
            setAudioFileName(file.name);

            const reader = new FileReader();
            const audio = new Audio(URL.createObjectURL(file));

            audio.onloadedmetadata = () => {
                const duration = Math.round(audio.duration);
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

                setSongData(prev => ({ ...prev, duration }));
                setAudioDuration(formattedDuration);
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

        if (!songData.title || !songData.artist_id || !songData.platform_id) {
            toast.error('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            // Prepare the data according to the API expectations
            const submitData = {
                title: songData.title,
                artist_id: songData.artist_id,
                platform_id: songData.platform_id,
                duration: songData.duration || null,
                // Only send cover_url if it's a valid URL (not base64)
                cover_url: songData.cover_url && !songData.cover_url.startsWith('data:') ? songData.cover_url : null,
                file_path: songData.file_path,
            };

            // If we have base64 image data, we need to handle it differently
            if (songData.cover_url && songData.cover_url.startsWith('data:')) {
                // For now, we'll skip the image if it's base64
                // In a production app, you'd want to upload the image to a server first
                console.log('Base64 image detected, skipping for now');
            }

            console.log('Submitting song data:', submitData);
            console.log('User ID:', auth.user.id);
            console.log('API endpoint will be: /api/songs/' + auth.user.id);

            const response = await songService.createSong(auth.user.id as string, submitData);

            console.log('Song creation response:', response);

            if (response.success) {
                toast.success('Song added successfully!');
                resetForm();
                setIsOpen(false);
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to add song');
            }
        } catch (error: any) {
            console.error('Error adding song:', error);

            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                toast.error(errors[0] as string);
            } else {
                toast.error('Failed to add song. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Music className="mr-2 h-4 w-4" />
                        Add Song
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Add New Song
                    </DialogTitle>
                    <p className="text-muted-foreground">
                        Upload a new song to your music library
                    </p>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading data...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information Section */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Music className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Basic Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-medium">
                                            Song Title *
                                        </Label>
                                        <Input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={songData.title}
                                            onChange={handleInputChange}
                                            placeholder="Enter song title"
                                            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Artist *
                                        </Label>
                                        <Select onValueChange={handleSelectChange('artist_id')}>
                                            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                                <SelectValue placeholder="Select an artist" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {artists.map((artist) => (
                                                    <SelectItem key={artist.id} value={artist.id}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                                                {artist.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span>{artist.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-medium">
                                            Platform *
                                        </Label>
                                        <Select onValueChange={handleSelectChange('platform_id')}>
                                            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                                                <SelectValue placeholder="Select a platform" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {platforms.map((platform) => (
                                                    <SelectItem key={platform.id} value={platform.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Disc className="w-4 h-4 text-muted-foreground" />
                                                            <span>{platform.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Audio File Section */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileAudio className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Audio File</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium">
                                            Song File *
                                        </Label>
                                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-primary/50">
                                            <Input
                                                type="file"
                                                ref={audioFileRef}
                                                accept="audio/*"
                                                onChange={handleAudioFileChange}
                                                className="hidden"
                                                id="audio-file"
                                                required
                                            />
                                            <div className="text-center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => audioFileRef.current?.click()}
                                                    className="mb-2"
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Choose Audio File
                                                </Button>
                                                <p className="text-xs text-muted-foreground">
                                                    Supports MP3, WAV, FLAC, AAC. Max 50MB.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {audioFileName && (
                                        <Card className="bg-muted/50">
                                            <CardContent className="pt-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <FileAudio className="h-4 w-4 text-primary" />
                                                        <span className="text-sm font-medium">{audioFileName}</span>
                                                    </div>
                                                    {audioDuration && (
                                                        <Badge variant="secondary" className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {audioDuration}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cover Image Section */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Image className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Cover Image</h3>
                                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                                </div>

                                <div className="space-y-4">
                                    {/* Image Preview */}
                                    {imagePreview && (
                                        <div className="relative w-32 h-32 mx-auto">
                                            <img
                                                src={imagePreview}
                                                alt="Cover preview"
                                                className="w-full h-full object-cover rounded-lg border shadow-md"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-lg"
                                                onClick={handleRemoveImage}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex gap-2 justify-center">
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
                                                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                            />
                                        ) : (
                                            <div className="space-y-2">
                                                <Input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    accept=".jpg,.jpeg,.png,.webp"
                                                    onChange={handleImageFileChange}
                                                    className="hidden"
                                                    id="image-file"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="w-full"
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Choose Image File
                                                </Button>
                                                <p className="text-xs text-muted-foreground text-center">
                                                    Supports JPG, PNG, WebP. Max 5MB.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Separator />

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding Song...
                                    </>
                                ) : (
                                    <>
                                        <Music className="mr-2 h-4 w-4" />
                                        Add Song
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}


