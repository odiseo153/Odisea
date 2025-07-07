<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Solo ejecutar si la tabla jobs existe y tiene problemas
        if (Schema::hasTable('jobs')) {
            // Verificar si la tabla tiene la estructura incorrecta
            $columns = Schema::getColumnListing('jobs');

            // Si existe la tabla, vamos a recrearla con la estructura correcta
            if (in_array('id', $columns)) {
                // Respaldar datos si existen
                $jobs = DB::table('jobs')->get();

                // Eliminar tabla existente
                Schema::dropIfExists('jobs');

                // Recrear con estructura correcta
                Schema::create('jobs', function (Blueprint $table) {
                    $table->bigIncrements('id'); // AUTO_INCREMENT
                    $table->string('queue')->index();
                    $table->longText('payload');
                    $table->unsignedTinyInteger('attempts');
                    $table->unsignedInteger('reserved_at')->nullable();
                    $table->unsignedInteger('available_at');
                    $table->unsignedInteger('created_at');
                });

                // Restaurar datos si existían
                foreach ($jobs as $job) {
                    DB::table('jobs')->insert((array)$job);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No hacer nada en el rollback para evitar pérdida de datos
    }
};
