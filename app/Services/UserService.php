<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Model;

class UserService extends BaseService
{
    public function __construct(UserRepository $repository)
    {
        parent::__construct($repository);
    }

    public function getUsersWithRelations()
    {
        return $this->repository->getWithRelations();
    }

    public function findUserByEmail(string $email)
    {
        return $this->repository->findByEmail($email);
    }

    public function searchUsersByName(string $name)
    {
        return $this->repository->searchByName($name);
    }

    public function getUserPlaylists(string $userId)
    {
        return $this->repository->getUserPlaylists($userId);
    }

    public function getUserFavoriteSongs(string $userId)
    {
        return $this->repository->getUserFavoriteSongs($userId);
    }

    public function getUserSongs(string $userId)
    {
        return $this->repository->getUserSongs($userId);
    }

    public function createUser(array $data)
    {
        dd($data);
        $user = new User();
        $user->fill($data);
        $user->password = Hash::make($data['password']);

        return $this->repository->create($user);
    }

    public function updateUser(User $user, array $data)
    {
     
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        return $this->repository->update($user, $data);
    }
} 