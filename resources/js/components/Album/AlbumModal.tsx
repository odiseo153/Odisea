import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Album, Artist } from "@/types"
import { toast } from "sonner"
import { Plus, Upload, X } from "lucide-react"
import { usePage } from "@inertiajs/react"
import { SharedData } from '@/types';
import { albumService } from '@/services/albumService';
import { artistService } from '@/services/artistService';

interface AlbumModalProps {
    album?: Album
    onSuccess?: (album: Album) => void
    trigger?: React.ReactNode
}

export function AlbumModal({ album, onSuccess, trigger }: AlbumModalProps) {
    const { auth } = usePage<SharedData>().props;

    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: album?.name || '',
        artist_id: album?.artist?.id || '',
        year: album?.year || '',
        cover_url: album?.cover_url || ''
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(album?.cover_url || null)
    const [imageType, setImageType] = useState<'url' | 'file'>('url')
    const [isLoading, setIsLoading] = useState(false)
    const [artists, setArtists] = useState<Artist[]>([])
    const [loadingArtists, setLoadingArtists] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadArtists()
    }, [])

    const loadArtists = async () => {
        setLoadingArtists(true)
        try {
            const response = await artistService.getAllArtists()
            setArtists(response.artists || [])
        } catch (error) {
            console.error('Error loading artists:', error)
            toast.error("Failed to load artists")
        } finally {
            setLoadingArtists(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
            if (!validTypes.includes(file.type)) {
                toast.error("Please select a valid image file (JPG, JPEG, or PNG)")
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB")
                return
            }

            setImageFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleRemoveImage = () => {
        setImageFile(null)
        setImagePreview(null)
        setFormData({...formData, cover_url: ''})
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleUrlChange = (url: string) => {
        setFormData({...formData, cover_url: url})
        setImagePreview(url)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let response

            // Handle file upload case
            if (imageType === 'file' && imageFile) {
                const formDataWithFile = new FormData()
                formDataWithFile.append('name', formData.name)
                formDataWithFile.append('artist_id', formData.artist_id)
            //    formDataWithFile.append('owner_id', auth.user.id)
                if (formData.year) formDataWithFile.append('year', formData.year)
                formDataWithFile.append('cover_image', imageFile)

                if (album) {
                    response = await albumService.updateAlbum(album.id, formDataWithFile)
                } else {
                    response = await albumService.createAlbum(formDataWithFile)
                }
            } else {
                // Handle URL case
                const requestData = {
                    name: formData.name,
                    artist_id: formData.artist_id,
                    year: formData.year || undefined,
                    cover_url: formData.cover_url || undefined,
                    owner_id: auth.user.id
                }
console.log(requestData)
                if (album) {
                    response = await albumService.updateAlbum(album.id, requestData)
                } else {
                    response = await albumService.createAlbum(requestData)
                }
            }

            toast.success(album ? "Album updated successfully" : "Album created successfully")

            if (onSuccess) {
                onSuccess(response.album)
            }

            // Reset form
            setFormData({
                name: '',
                artist_id: '',
                year: '',
                cover_url: ''
            })
            setImageFile(null)
            setImagePreview(null)
            setImageType('url')
            setIsOpen(false)
        } catch (error: any) {
            console.error('Error:', error)

            // Handle validation errors
            if (error?.response?.data?.errors) {
                const errors = error.response.data.errors
                Object.keys(errors).forEach(key => {
                    toast.error(errors[key][0])
                })
            } else {
                toast.error(album ? "Failed to update album" : "Failed to create album")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const currentYear = new Date().getFullYear()

    const defaultTrigger = (
        <Button variant={album ? "outline" : "default"}>
            {album ? (
                "Edit Album"
            ) : (
                <>
                    <Plus className="mr-2 h-4 w-4" />
                    New Album
                </>
            )}
        </Button>
    )

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {album ? "Edit Album" : "Create New Album"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Album Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Enter album name"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="artist">Artist *</Label>
                        <Select
                            value={formData.artist_id}
                            onValueChange={(value) => setFormData({...formData, artist_id: value})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an artist" />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingArtists ? (
                                    <SelectItem value="loading" disabled>Loading artists...</SelectItem>
                                ) : (
                                    artists.map((artist) => (
                                        <SelectItem key={artist.id} value={artist.id}>
                                            {artist.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="year">Year</Label>
                        <Input
                            id="year"
                            type="number"
                            min="1900"
                            max={currentYear}
                            value={formData.year}
                            onChange={(e) => setFormData({...formData, year: e.target.value})}
                            placeholder="Enter release year"
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
                                    value={formData.cover_url}
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

                    <Button type="submit" className="w-full" disabled={isLoading || !formData.name || !formData.artist_id}>
                        {isLoading ? (
                            <>Processing...</>
                        ) : (
                            album ? "Save Changes" : "Create Album"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
