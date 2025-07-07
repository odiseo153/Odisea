<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Test channel for real-time events
Broadcast::channel('test-channel', function () {
    return true; // Allow anyone to join this channel (for testing purposes)
});

// Music app specific channels
Broadcast::channel('music-updates', function () {
    return true; // Public channel for music updates
});

Broadcast::channel('user-activity.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
