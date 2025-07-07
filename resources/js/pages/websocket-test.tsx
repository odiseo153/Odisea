import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import WebSocketTest from '@/components/WebSocketTest';

export default function WebSocketTestPage() {
    return (
        <AppLayout>
            <Head title="WebSocket Test - Reverb" />

            <div className="min-h-screen bg-gray-50">
                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Prueba de WebSocket
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Prueba la integración de Laravel Reverb con React en tiempo real.
                            </p>
                        </div>

                        <WebSocketTest />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
