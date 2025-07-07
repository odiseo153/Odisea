<?php

namespace App\Http\Controllers\Api;

use App\Models\Artist;
use App\Http\Controllers\Controller;

class ArtistController extends Controller
{

    public function index()
    {

        return response()->json([
            'success' => true,
            'artists' => Artist::all()
        ]);
    }



    public function show(Artist $artist)
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $artist->load(['songs'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }






}
