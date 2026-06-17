<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 10; 
        $searchTerm = $request->input('search'); 

        $usermanagements = User::query()
            ->with('roles') 
            ->when($searchTerm, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhereHas('roles', function ($q) use ($search) {
                          $q->where('name', 'like', "%{$search}%");
                      });
            })
            ->orderBy('created_at', 'ASC')
            ->paginate($perPage) 
            ->withQueryString(); 

        return Inertia::render("UserManagements/index", [
            "usermanagements" => $usermanagements,
            "filter" => $request->only('search'), 
        ]);
    }

    public function create()
    {
        return inertia('UserManagements/create', [
            "roles" => Role::pluck('name')
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:250',
            'email' => 'required|string|max:250',
            'password' => 'required|string|max:250',
            
        ]);

        $user = User::create($request->all(['name', 'email']) + [ 'password' => Hash::make($request->password)]);
        $user->syncRoles([$request->roles]);
        return redirect()->route('usermanagements.index')->with('message', 'Users Creadted Successfully');
    }

    public function edit(User $user){
        return inertia('UserManagements/edit', [
            "user" => $user,
            "userRoles" => $user->roles()->pluck('name'),
            "roles" => Role::pluck('name')
        ]);
    }
    
    public function show(User $user){
        $user->load('roles'); 
        return inertia('UserManagements/show', [
            "user" => $user,
            "userRoles" => $user->roles()->pluck('name') 
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'     => 'required|string|max:250',
            'email'    => 'required|email|max:250|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:6|max:250',
        ]);

        $updateData = [
            'name'  => $request->input('name'),
            'email' => $request->input('email'),
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->input('password'));
        }

        $user->update($updateData);
        $user->syncRoles([$request->roles]);

        return to_route('usermanagements.index')->with('message', 'User Berhasil Diperbarui');
    }

    public function destroy(User $user){
        $user->delete();
        return redirect()->route('usermanagements.index')->with('message', 'User deleted Successfully');
    }
}
