import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import axios from 'axios';

interface WebSocketMessage {
    message: string;
    timestamp: string;
}

interface ConnectionInfo {
    websocket: {
        app_key: string;
        host: string;
        port: number;
        scheme: string;
    };
    channels: Record<string, string>;
}

const WebSocketTest: React.FC = () => {
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize WebSocket connection
    useEffect(() => {
        const initializeWebSocket = async () => {
            try {
                // Get connection info from backend
                const response = await axios.get('/api/websocket/connection-info');
                setConnectionInfo(response.data);

                // Dynamically import and configure Echo
                const [{ default: Echo }, { default: Pusher }] = await Promise.all([
                    import('laravel-echo'),
                    import('pusher-js')
                ]);

                // Configure Echo
                const echo = new Echo({
                    broadcaster: 'pusher',
                    key: response.data.websocket.app_key || 'odisea-key',
                    cluster: 'mt1',
                    wsHost: response.data.websocket.host || 'localhost',
                    wsPort: response.data.websocket.port || 8080,
                    wssPort: response.data.websocket.port || 8080,
                    forceTLS: response.data.websocket.scheme === 'https',
                    enabledTransports: ['ws', 'wss'],
                    disableStats: true,
                });

                // Listen to test channel
                echo.channel('test-channel')
                    .listen('.test-event', (e: WebSocketMessage) => {
                        console.log('Received WebSocket message:', e);
                        setMessages(prev => [...prev, {
                            message: e.message,
                            timestamp: e.timestamp
                        }]);
                    });

                // Connection events
                echo.connector.pusher.connection.bind('connected', () => {
                    console.log('WebSocket connected');
                    setIsConnected(true);
                });

                echo.connector.pusher.connection.bind('disconnected', () => {
                    console.log('WebSocket disconnected');
                    setIsConnected(false);
                });

                echo.connector.pusher.connection.bind('error', (err: unknown) => {
                    console.error('WebSocket error:', err);
                    setIsConnected(false);
                });

            } catch (error) {
                console.error('Failed to initialize WebSocket:', error);
            }
        };

        initializeWebSocket();
    }, []);

    const sendTestMessage = async () => {
        if (!inputMessage.trim()) return;

        setIsLoading(true);
        try {
            await axios.post('/api/websocket/emit-test', {
                message: inputMessage
            });
            setInputMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendBroadcastMessage = async () => {
        if (!inputMessage.trim()) return;

        setIsLoading(true);
        try {
            await axios.post('/api/websocket/broadcast', {
                message: inputMessage,
                channel: 'test-channel'
            });
            setInputMessage('');
        } catch (error) {
            console.error('Failed to broadcast message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        WebSocket Test - Laravel Reverb
                        <Badge variant={isConnected ? "default" : "destructive"}>
                            {isConnected ? "Conectado" : "Desconectado"}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {connectionInfo && (
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                                <strong>Host:</strong> {connectionInfo.websocket.host}
                            </div>
                            <div>
                                <strong>Puerto:</strong> {connectionInfo.websocket.port}
                            </div>
                            <div>
                                <strong>Esquema:</strong> {connectionInfo.websocket.scheme}
                            </div>
                            <div>
                                <strong>App Key:</strong> {connectionInfo.websocket.app_key}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 mb-4">
                        <Input
                            placeholder="Escribe un mensaje para enviar..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
                        />
                        <Button
                            onClick={sendTestMessage}
                            disabled={isLoading || !inputMessage.trim()}
                        >
                            Enviar Test
                        </Button>
                        <Button
                            onClick={sendBroadcastMessage}
                            disabled={isLoading || !inputMessage.trim()}
                            variant="outline"
                        >
                            Broadcast
                        </Button>
                        <Button
                            onClick={clearMessages}
                            variant="destructive"
                            size="sm"
                        >
                            Limpiar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mensajes Recibidos ({messages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {messages.length === 0 ? (
                            <p className="text-gray-500 italic">
                                No hay mensajes. Envía un mensaje para probar la conexión WebSocket.
                            </p>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={index} className="p-3 bg-gray-100 rounded-lg border">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium text-gray-800">{msg.message}</p>
                                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WebSocketTest;
