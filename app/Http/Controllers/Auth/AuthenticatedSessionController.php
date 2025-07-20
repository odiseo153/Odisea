<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $deviceName = $request->input('device_name', 'web-session');

        $request->session()->regenerate();

        // Create token for API usage even from web login
        $token = $request->user()->createToken($deviceName)->plainTextToken;

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Add logging to debug
        \Log::info('Logout method called', [
            'user_id' => $request->user()?->id,
            'session_id' => $request->session()->getId(),
            'request_method' => $request->method(),
            'request_url' => $request->url()
        ]);

        // Delete all tokens for the user
        if ($request->user()) {
            $request->user()->tokens()->delete();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        \Log::info('Logout completed successfully');

        return redirect('/login');
    }
}
