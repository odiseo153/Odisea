import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { AlbumModal, AddSongToAlbumModal } from '@/components/Album';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Album } from '@/types';

// Datos de ejemplo para demostrar la funcionalidad
const sampleAlbum: Album = {
    id: "1",
    name: "Sample Album",
    year: "2023",
    cover_url: "https://via.placeholder.com/300x300",
    artist: {
        id: "1",
        name: "Sample Artist",
        image_url: "https://via.placeholder.com/50x50",
        bio: "This is a sample artist for demonstration purposes."
    },
    songs: [
        {
            id: "1",
            title: "Sample Song 1",
            duration: "3:45",
            is_favorite: false,
            cover_url: "https://via.placeholder.com/50x50"
        },
        {
            id: "2",
            title: "Sample Song 2",
            duration: "4:20",
            is_favorite: false,
            cover_url: "https://via.placeholder.com/50x50"
        }
    ]
};

export default function AlbumModalTest() {
    const handleAlbumSuccess = (album: Album) => {
        console.log('Album created/updated:', album);
        // Aquí normalmente recargarías los datos o actualizarías el estado
    };

    const handleSongAdded = (song: any) => {
        console.log('Song added:', song);
        // Aquí normalmente recargarías los datos o actualizarías el estado
    };

    return (
        <AppLayout>
            <Head title="Album Modal Test" />

            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">Album Modal Test Page</h1>
                    <p className="text-muted-foreground">
                        Esta página demuestra la funcionalidad de las modales de álbumes.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Card para crear álbum */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Album Modal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Haz clic en el botón para abrir la modal de creación de álbum.
                            </p>
                            <AlbumModal
                                onSuccess={handleAlbumSuccess}
                                trigger={
                                    <Button className="w-full">
                                        Create New Album
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Card para editar álbum */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Album Modal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Haz clic en el botón para abrir la modal de edición con datos de ejemplo.
                            </p>
                            <AlbumModal
                                album={sampleAlbum}
                                onSuccess={handleAlbumSuccess}
                                trigger={
                                    <Button variant="outline" className="w-full">
                                        Edit Sample Album
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Card para agregar canciones */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Songs to Album Modal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Haz clic en el botón para abrir la modal de agregar canciones al álbum.
                            </p>
                            <AddSongToAlbumModal
                                album={sampleAlbum}
                                onSongAdded={handleSongAdded}
                                trigger={
                                    <Button variant="secondary" className="w-full">
                                        Add Songs to Album
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Card con información */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Crear álbumes con imagen (URL o archivo)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Seleccionar artista desde dropdown
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Validación de formularios
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Búsqueda de canciones en tiempo real
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Prevención de duplicados
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Manejo de errores
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Notas de implementación:</h3>
                    <ul className="text-sm space-y-1">
                        <li>• Las modales están completamente integradas con el backend</li>
                        <li>• Soporte para subida de archivos y URLs</li>
                        <li>• Validación tanto del lado cliente como servidor</li>
                        <li>• Componentes reutilizables y personalizables</li>
                        <li>• Diseño responsive y accesible</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
