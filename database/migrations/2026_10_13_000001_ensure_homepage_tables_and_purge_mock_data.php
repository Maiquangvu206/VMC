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
        // 1. Chuẩn hóa tên bảng homepage_articles (đặc biệt cho Ubuntu Linux MySQL phân biệt hoa thường)
        if (Schema::hasTable('Homepage_Articles') && !Schema::hasTable('homepage_articles')) {
            Schema::rename('Homepage_Articles', 'homepage_articles');
        }

        if (!Schema::hasTable('homepage_articles')) {
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

        // 2. Chuẩn hóa tên bảng homepage_media (đặc biệt cho Ubuntu Linux MySQL phân biệt hoa thường)
        if (Schema::hasTable('Homepage_Media') && !Schema::hasTable('homepage_media')) {
            Schema::rename('Homepage_Media', 'homepage_media');
        }

        if (!Schema::hasTable('homepage_media')) {
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

        // 3. Quét sạch và thanh trừng triệt để dữ liệu mẫu (mock data art-1, med-1) trong bảng system_settings
        $settingsTable = Schema::hasTable('system_settings') ? 'system_settings' : (Schema::hasTable('System_Settings') ? 'System_Settings' : null);
        if ($settingsTable) {
            DB::table($settingsTable)
                ->where('setting_key', 'VMC_HOMEPAGE_ARTICLES')
                ->where(function ($q) {
                    $q->where('setting_value', 'like', '%art-1%')
                      ->orWhere('setting_value', 'like', '%Hành Trình 6 Năm%');
                })
                ->update(['setting_value' => '[]']);

            DB::table($settingsTable)
                ->where('setting_key', 'VMC_HOMEPAGE_MEDIA')
                ->where(function ($q) {
                    $q->where('setting_value', 'like', '%med-1%')
                      ->orWhere('setting_value', 'like', '%unsplash.com%');
                })
                ->update(['setting_value' => '[]']);
        }

        // 4. Quét sạch dữ liệu mẫu nếu từng bị lưu vào bảng chuyên biệt
        if (Schema::hasTable('homepage_articles')) {
            DB::table('homepage_articles')
                ->whereIn('id', ['art-1', 'art-2', 'art-3'])
                ->orWhere('title', 'like', '%Hành Trình 6 Năm%')
                ->delete();
        }

        if (Schema::hasTable('homepage_media')) {
            DB::table('homepage_media')
                ->whereIn('id', ['med-1', 'med-2', 'med-3', 'med-4', 'med-5', 'med-6'])
                ->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Giữ nguyên dữ liệu, không drop
    }
};
