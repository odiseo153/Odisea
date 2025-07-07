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
        Schema::create('songs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('platform_id')->constrained('platforms')->onDelete('cascade');
            $table->foreignUuid('artist_id')->nullable()->constrained('artists')->onDelete('cascade');
            $table->foreignUuid('album_id')->nullable()->constrained('albums')->onDelete('cascade');
            $table->foreignUuid('added_by')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->integer('duration');
            $table->string('cover_url')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('songs');
    }
};
