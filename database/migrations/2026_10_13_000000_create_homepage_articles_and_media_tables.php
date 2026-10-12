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
        // 1. homepage_articles
        if (!Schema::hasTable('homepage_articles') && !Schema::hasTable('Homepage_Articles')) {
            Schema::create('homepage_articles', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('title', 255);
                $table->string('category', 100)->default('Hoạt động nổi bật');
                $table->string('author', 100)->default('Ban Biên Tập VMC');
                $table->text('summary')->nullable();
                $table->longText('content')->nullable();
                $table->longText('cover_image')->nullable();
                $table->string('video_url', 1000)->nullable();
                $table->longText('images')->nullable();
                $table->string('date', 50)->nullable();
                $table->boolean('is_pinned')->default(false);
                $table->integer('view_count')->default(0);
                $table->timestamps();

                $table->index('category');
                $table->index('date');
                $table->index('is_pinned');
            });
        }

        // 2. homepage_media
        if (!Schema::hasTable('homepage_media') && !Schema::hasTable('Homepage_Media')) {
            Schema::create('homepage_media', function (Blueprint $table) {
                $table->string('id', 100)->primary();
                $table->string('title', 255);
                $table->enum('type', ['image', 'video'])->default('image');
                $table->string('category', 100)->default('Toàn CLB');
                $table->longText('media_url')->nullable();
                $table->longText('thumbnail')->nullable();
                $table->longText('images')->nullable();
                $table->text('description')->nullable();
                $table->string('date', 50)->nullable();
                $table->timestamps();

                $table->index('type');
                $table->index('category');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homepage_media');
        Schema::dropIfExists('Homepage_Media');
        Schema::dropIfExists('homepage_articles');
        Schema::dropIfExists('Homepage_Articles');
    }
};
