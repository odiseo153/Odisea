<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gender_songs', static function (Blueprint $table): void {
            $table->id();
            $table->foreignUuid('gender_id')->constrained('genders')->onDelete('cascade');
            $table->foreignUuid('song_id')->constrained('songs')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gender_songs');
    }
};
