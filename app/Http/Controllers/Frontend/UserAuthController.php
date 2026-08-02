<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRegisterRequest;
use App\Models\User;
use Database\Factories\UserFactory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserAuthController extends Controller
{
    public function loginPage(Request $request): Response
    {
        return Inertia::render('Frontend/UserAuth/UserLogin', [
            'status' => $request->session()->get('status'),
        ]);
    }


    /**
     * @throws ValidationException
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $request->session()->regenerate();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User login😊  Successfully.')
        ]);
        
        return redirect()->intended(route('home'));
    }


    public function registerPage(): Response
    {
        return Inertia::render('Frontend/UserAuth/UserRegister');
    }

    public function registerUser(UserRegisterRequest $request)
    {

        // Create the user
        $user = User::create(array_merge(
            $request->validated(),
            ['password' => bcrypt($request->password)]
        ));

        $user->assignRole('User');

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User Registered 😊 Successfully.')
        ]);

        return to_route('loginPage');
    }

    public function userLogout(Request $request)
    {
        
        Auth::logout();
    
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User LogOut😔 Successfully.')
        ]);
        return to_route('home');
    }
}
