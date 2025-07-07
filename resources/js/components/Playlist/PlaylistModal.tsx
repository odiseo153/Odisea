import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Playlist } from "@/types"
import { toast } from "sonner"
import { Plus, Upload, X } from "lucide-react"
import { usePage } from "@inertiajs/react"
import { SharedData } from '@/types';
import { playlistService } from '@/services/playlistService';

interface PlaylistModalProps {
    playlist?: Playlist
    onSuccess?: (playlist: Playlist) => void
    trigger?: React.ReactNode
}

export function PlaylistModal({ playlist, onSuccess, trigger }: PlaylistModalProps) {
    const { auth } = usePage<SharedData>().props;

    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: playlist?.name || '',
        is_public: playlist?.is_public || false,
        cover_image: playlist?.cover_image || ''
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(playlist?.cover_image || null)
    const [imageType, setImageType] = useState<'url' | 'file'>('url')
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
        setFormData({...formData, cover_image: ''})
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleUrlChange = (url: string) => {
        setFormData({...formData, cover_image: url})
        setImagePreview(url)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let response
            const requestData: Playlist = {
                name: formData.name,
                is_public: formData.is_public,
                user_id: auth.user.id || '',
                creator: auth.user,
              //  cover_image: formData.cover_image,
                cover_image_url: formData.cover_image
            }

            // Handle file upload case
            if (imageType === 'file' && imageFile) {
                const formDataWithFile = new FormData()
                formDataWithFile.append('name', formData.name)
                formDataWithFile.append('is_public', formData.is_public.toString())
                formDataWithFile.append('cover_image', imageFile)

                if (playlist) {
                    response = await playlistService.updatePlaylist(playlist.id!, formDataWithFile)
                } else {
                    response = await playlistService.createPlaylist(formDataWithFile)
                }
            } else {


                if (playlist) {
                    response = await playlistService.updatePlaylist(playlist.id!, requestData)
                } else {
                    response = await playlistService.createPlaylist(requestData)
                }
            }

            toast.success(playlist ? "Playlist updated successfully" : "Playlist created successfully")

            if (onSuccess) {
                onSuccess(response.playlist)
            }

            // Reset form
            setFormData({
                name: '',
                is_public: false,
                cover_image: ''
            })
            setImageFile(null)
            setImagePreview(null)
            setImageType('url')
            setIsOpen(false)
        } catch (error) {
            console.error('Error:', error)
            toast.error(playlist ? "Failed to update playlist" : "Failed to create playlist")
        } finally {
            setIsLoading(false)
        }
    }

    const defaultTrigger = (
        <Button variant={playlist ? "outline" : "default"}>
            {playlist ? (
                "Edit Playlist"
            ) : (
                <>
                    <Plus className="mr-2 h-4 w-4" />
                    New Playlist
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
                        {playlist ? "Edit Playlist" : "Create New Playlist"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="My Awesome Playlist"
                            required
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
                                    value={formData.cover_image}
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

                    <div className="flex items-center gap-2">
                        <Switch
                            id="public"
                            checked={formData.is_public}
                            onCheckedChange={(checked) => setFormData({...formData, is_public: checked})}
                        />
                        <Label htmlFor="public">Make playlist public</Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>Processing...</>
                        ) : (
                            playlist ? "Save Changes" : "Create Playlist"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
