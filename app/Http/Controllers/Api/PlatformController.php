<?php

namespace App\Http\Controllers\Api;

use App\Models\Platform;
use App\Services\PlatformService;
use App\Http\Requests\PlatformRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PlatformController extends Controller
{
    public function __construct(private readonly PlatformService $platformService)
    {
    }

    public function index()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->platformService->getAllData()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Platform $platform)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $platform->load(['songs'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(PlatformRequest $request)
    {
        try {
            $platform = $this->platformService->createPlatform($request->validated());
            return response()->json([
                'success' => true,
                'data' => $platform,
                'message' => 'Platform created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function update(PlatformRequest $request, Platform $platform)
    {
        try {
            $this->platformService->updatePlatform($platform->id, $request->validated());
            return response()->json([
                'success' => true,
                'data' => $platform->fresh(),
                'message' => 'Platform updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Platform $platform)
    {
        try {
            $this->platformService->deleteData($platform->id);
            return response()->json([
                'success' => true,
                'message' => 'Platform deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Métodos adicionales específicos
    public function search(Request $request)
    {
        try {
            $name = $request->query('name');
            $platforms = $this->platformService->searchPlatformsByName($name);
            return response()->json([
                'success' => true,
                'data' => $platforms
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function withSongs()
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $this->platformService->getPlatformsWithSongs()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
