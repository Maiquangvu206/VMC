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
        if (Schema::hasTable('Finances') && !Schema::hasColumn('Finances', 'approved_by')) {
            Schema::table('Finances', function (Blueprint $table) {
                $table->string('approved_by', 255)->nullable()->after('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('Finances') && Schema::hasColumn('Finances', 'approved_by')) {
            Schema::table('Finances', function (Blueprint $table) {
                $table->dropColumn('approved_by');
            });
        }
    }
};
