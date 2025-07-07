<?php

namespace Database\Factories;

use App\Models\{User,Song,Album,Artist,Playlist,Gender};
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Interaction>
 */
class InteractionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $interactableType = $this->faker->randomElement([Song::class, Album::class, Artist::class, Playlist::class]);
        $interactableModel = $this->faker->randomElement([
            Song::factory(),
            Album::factory(),
            Artist::factory(),
            Playlist::factory()
        ]);

        return [
            'user_id' => User::factory(),
            'interactable_id' => $interactableModel,
            'interactable_type' => $interactableType,
            'play_count' => $this->faker->numberBetween(1, int2: 1000)
        ];
    }
}
