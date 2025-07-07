<?php

namespace App\Http\Controllers;

use App\Events\TestRealtimeEvent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WebSocketController extends Controller
{
    /**
     * Emit a test event to WebSocket
     */
    public function emitTestEvent(Request $request): JsonResponse
    {
        $message = $request->input('message', 'Mensaje de prueba desde el backend');

        // Emit the event
        event(new TestRealtimeEvent($message));

        return response()->json([
            'success' => true,
            'message' => 'Evento emitido correctamente',
            'data' => [
                'message' => $message,
                'timestamp' => now()->format('Y-m-d H:i:s')
            ]
        ]);
    }

    /**
     * Get WebSocket connection info
     */
    public function getConnectionInfo(): JsonResponse
    {
        return response()->json([
            'websocket' => [
                'app_key' => config('broadcasting.connections.reverb.key'),
                'host' => config('broadcasting.connections.reverb.options.host'),
                'port' => config('broadcasting.connections.reverb.options.port'),
                'scheme' => config('broadcasting.connections.reverb.options.scheme'),
            ],
            'channels' => [
                'test-channel' => 'Canal de prueba para eventos en tiempo real'
            ]
        ]);
    }

    /**
     * Broadcast a message to a specific channel
     */
    public function broadcastMessage(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'channel' => 'nullable|string|max:100'
        ]);

        $message = $request->input('message');
        $channel = $request->input('channel', 'test-channel');

        // For now, we'll use the test event
        // In a real app, you might create different events for different channels
        event(new TestRealtimeEvent($message));

        return response()->json([
            'success' => true,
            'message' => 'Mensaje enviado correctamente',
            'data' => [
                'channel' => $channel,
                'message' => $message,
                'timestamp' => now()->format('Y-m-d H:i:s')
            ]
        ]);
    }
}