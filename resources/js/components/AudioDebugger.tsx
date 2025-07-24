import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { audioService } from '@/services/audioService';
import { toast } from 'sonner';

export default function AudioDebugger() {
    const [songId, setSongId] = useState('');
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [audioInfo, setAudioInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const debugAudio = async () => {
        if (!songId) {
            toast.error('Please enter a song ID');
            return;
        }

        setIsLoading(true);
        try {
            // Get debug info from backend
            const debugResponse = await fetch(`/api/audio/debug/${songId}`);
            const debugData = await debugResponse.json();
            setDebugInfo(debugData);

            // Try to get audio info
            try {
                const audioData = await audioService.getAudioInfo(songId);
                setAudioInfo(audioData);
            } catch (error) {
                console.error('Audio info error:', error);
                setAudioInfo({ error: error.message });
            }

            // Test stream URL
            const streamUrl = audioService.getStreamUrl(songId);
            console.log('Stream URL:', streamUrl);

            // Test if stream is accessible
            try {
                const streamTest = await fetch(streamUrl, { method: 'HEAD' });
                console.log('Stream test response:', streamTest.status, streamTest.statusText);
            } catch (error) {
                console.error('Stream test error:', error);
            }

        } catch (error) {
            console.error('Debug error:', error);
            toast.error('Debug failed: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const testAudioPlayback = () => {
        if (!songId) {
            toast.error('Please enter a song ID');
            return;
        }

        const streamUrl = audioService.getStreamUrl(songId);
        const audio = new Audio(streamUrl);
        
        audio.addEventListener('loadstart', () => console.log('Audio: loadstart'));
        audio.addEventListener('loadedmetadata', () => console.log('Audio: loadedmetadata'));
        audio.addEventListener('canplay', () => console.log('Audio: canplay'));
        audio.addEventListener('error', (e) => console.error('Audio: error', e));
        
        audio.play().then(() => {
            console.log('Audio playback started');
            toast.success('Audio playback started');
            setTimeout(() => {
                audio.pause();
                console.log('Audio paused');
            }, 3000);
        }).catch((error) => {
            console.error('Audio playback failed:', error);
            toast.error('Audio playback failed: ' + error.message);
        });
    };

    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Audio Debugger</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter Song ID"
                            value={songId}
                            onChange={(e) => setSongId(e.target.value)}
                        />
                        <Button onClick={debugAudio} disabled={isLoading}>
                            {isLoading ? 'Debugging...' : 'Debug'}
                        </Button>
                        <Button onClick={testAudioPlayback} variant="outline">
                            Test Playback
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {debugInfo && (
                <Card>
                    <CardHeader>
                        <CardTitle>Debug Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong>Song ID:</strong> {debugInfo.song_id}
                            </div>
                            <div>
                                <strong>Song Title:</strong> {debugInfo.song_title}
                            </div>
                            <div>
                                <strong>File Path:</strong> {debugInfo.original_file_path}
                            </div>
                            <div>
                                <strong>Storage Path:</strong> {debugInfo.storage_path}
                            </div>
                            <div>
                                <strong>File Exists:</strong> 
                                <Badge variant={debugInfo.file_exists ? 'default' : 'destructive'}>
                                    {debugInfo.file_exists ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div>
                                <strong>Storage Disk Exists:</strong>
                                <Badge variant={debugInfo.storage_disk_exists ? 'default' : 'destructive'}>
                                    {debugInfo.storage_disk_exists ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            {debugInfo.file_size && (
                                <div>
                                    <strong>File Size:</strong> {(debugInfo.file_size / 1024 / 1024).toFixed(2)} MB
                                </div>
                            )}
                            {debugInfo.mime_type && (
                                <div>
                                    <strong>MIME Type:</strong> {debugInfo.mime_type}
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <strong>Absolute Path:</strong>
                            <code className="block bg-muted p-2 rounded text-sm mt-1">
                                {debugInfo.absolute_path}
                            </code>
                        </div>
                    </CardContent>
                </Card>
            )}

            {audioInfo && (
                <Card>
                    <CardHeader>
                        <CardTitle>Audio Service Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                            {JSON.stringify(audioInfo, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}