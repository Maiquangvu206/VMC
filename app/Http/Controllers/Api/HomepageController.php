<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HomepageArticle;
use App\Models\HomepageMedia;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HomepageController extends Controller
{
    /**
     * Tự động khởi tạo và chuẩn hóa cấu trúc bảng CSDL nếu server chưa có
     */
    public function ensureHomepageTablesExist(): void
    {
        static $checked = false;
        if ($checked) return;
        $checked = true;

        try {
            // 1. Tự động tạo bảng homepage_articles nếu chưa tồn tại
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

            // 2. Tự động tạo bảng homepage_media nếu chưa tồn tại
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

            // 3. Tự động phục hồi dữ liệu từ System_Settings sang bảng chuyên biệt nếu bảng còn trống
            $this->migrateFromSettingsIfEmpty();
        } catch (\Throwable $e) {
            Log::warning('ensureHomepageTablesExist warning: ' . $e->getMessage());
        }
    }

    /**
     * Di chuyển dữ liệu đã lưu từ System_Settings sang bảng quan hệ nếu bảng quan hệ đang trống
     */
    private function migrateFromSettingsIfEmpty(): void
    {
        try {
            // Kiểm tra Articles
            if (HomepageArticle::count() === 0) {
                $setting = SystemSetting::where('setting_key', 'VMC_HOMEPAGE_ARTICLES')->first();
                if ($setting && !empty($setting->setting_value)) {
                    $list = json_decode($setting->setting_value, true);
                    if (Array_isArray($list)) {
                        foreach ($list as $art) {
                            if (!empty($art['id']) && !in_array($art['id'], ['art-1', 'art-2', 'art-3']) && !str_contains($art['title'] ?? '', 'Hành Trình 6 Năm')) {
                                HomepageArticle::updateOrCreate(
                                    ['id' => (string)$art['id']],
                                    [
                                        'title' => (string)($art['title'] ?? 'Bài viết mới'),
                                        'category' => (string)($art['category'] ?? 'Hoạt động nổi bật'),
                                        'author' => (string)($art['author'] ?? 'Ban Biên Tập VMC'),
                                        'summary' => (string)($art['summary'] ?? ''),
                                        'content' => (string)($art['content'] ?? ''),
                                        'cover_image' => (string)($art['coverImage'] ?? ($art['cover_image'] ?? '')),
                                        'video_url' => !empty($art['videoUrl']) ? (string)$art['videoUrl'] : (!empty($art['video_url']) ? (string)$art['video_url'] : null),
                                        'images' => is_array($art['images'] ?? null) ? $art['images'] : (json_decode($art['images'] ?? '[]', true) ?: []),
                                        'date' => (string)($art['date'] ?? date('d/m/Y')),
                                        'is_pinned' => !empty($art['isPinned']) || !empty($art['is_pinned']),
                                        'view_count' => (int)($art['viewCount'] ?? ($art['view_count'] ?? 0)),
                                    ]
                                );
                            }
                        }
                    }
                }
            }

            // Kiểm tra Media
            if (HomepageMedia::count() === 0) {
                $setting = SystemSetting::where('setting_key', 'VMC_HOMEPAGE_MEDIA')->first();
                if ($setting && !empty($setting->setting_value)) {
                    $list = json_decode($setting->setting_value, true);
                    if (Array_isArray($list)) {
                        foreach ($list as $item) {
                            if (!empty($item['id']) && !in_array($item['id'], ['med-1', 'med-2', 'med-3', 'med-4', 'med-5', 'med-6'])) {
                                HomepageMedia::updateOrCreate(
                                    ['id' => (string)$item['id']],
                                    [
                                        'title' => (string)($item['title'] ?? 'Tư liệu mới'),
                                        'type' => (string)($item['type'] ?? 'image'),
                                        'category' => (string)($item['category'] ?? 'Toàn CLB'),
                                        'media_url' => (string)($item['mediaUrl'] ?? ($item['media_url'] ?? '')),
                                        'thumbnail' => (string)($item['thumbnail'] ?? ''),
                                        'images' => is_array($item['images'] ?? null) ? $item['images'] : (json_decode($item['images'] ?? '[]', true) ?: []),
                                        'description' => (string)($item['description'] ?? ''),
                                        'date' => (string)($item['date'] ?? date('d/m/Y')),
                                    ]
                                );
                            }
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('migrateFromSettingsIfEmpty: ' . $e->getMessage());
        }
    }

    /**
     * GET /api/homepage/articles
     * Lấy danh sách bài viết từ bảng chuyên biệt homepage_articles
     */
    public function indexArticles()
    {
        try {
            $this->ensureHomepageTablesExist();

            $articles = HomepageArticle::orderBy('is_pinned', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->reject(function ($art) {
                    return in_array($art->id, ['art-1', 'art-2', 'art-3']) || str_contains($art->title, 'Hành Trình 6 Năm');
                });

            // Map thuộc tính chuẩn camelCase cho giao diện React
            $formatted = $articles->values()->map(function ($art) {
                return [
                    'id' => (string)$art->id,
                    'title' => (string)$art->title,
                    'category' => (string)($art->category ?: 'Hoạt động nổi bật'),
                    'author' => (string)($art->author ?: 'Ban Biên Tập VMC'),
                    'summary' => (string)($art->summary ?: ''),
                    'content' => (string)($art->content ?: ''),
                    'coverImage' => (string)($art->cover_image ?: ''),
                    'videoUrl' => (string)($art->video_url ?: ''),
                    'images' => is_array($art->images) ? $art->images : (json_decode($art->images, true) ?: []),
                    'date' => (string)($art->date ?: date('d/m/Y')),
                    'isPinned' => (bool)$art->is_pinned,
                    'viewCount' => (int)$art->view_count,
                    'createdAt' => (string)$art->created_at,
                    'updatedAt' => (string)$art->updated_at,
                ];
            });

            return response()->json(['success' => true, 'data' => $formatted]);
        } catch (\Throwable $e) {
            Log::error('indexArticles error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/homepage/articles
     * Thêm mới hoặc cập nhật 1 bài viết trong bảng chuyên biệt homepage_articles
     */
    public function storeArticle(Request $request)
    {
        try {
            $this->ensureHomepageTablesExist();

            $data = $request->json()->all();
            if (empty($data)) {
                $data = $request->all();
            }
            if (empty($data)) {
                $raw = $request->getContent();
                if (!empty($raw)) {
                    $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);
                    $data = json_decode($raw, true) ?: [];
                }
            }

            $id = !empty($data['id']) ? trim((string)$data['id']) : ('art-' . time() . '-' . rand(100, 999));
            $title = !empty($data['title']) ? trim((string)$data['title']) : 'Bài viết mới';
            $category = !empty($data['category']) ? trim((string)$data['category']) : 'Hoạt động nổi bật';
            $author = !empty($data['author']) ? trim((string)$data['author']) : 'Ban Biên Tập VMC';
            $summary = isset($data['summary']) ? (string)$data['summary'] : '';
            $content = isset($data['content']) ? (string)$data['content'] : '';
            $coverImage = isset($data['coverImage']) ? (string)$data['coverImage'] : (isset($data['cover_image']) ? (string)$data['cover_image'] : '');
            $videoUrl = !empty($data['videoUrl']) ? (string)$data['videoUrl'] : (!empty($data['video_url']) ? (string)$data['video_url'] : null);
            
            $images = $data['images'] ?? [];
            if (is_string($images)) {
                $images = json_decode($images, true) ?: [];
            }
            if (!is_array($images)) {
                $images = [];
            }

            $date = !empty($data['date']) ? trim((string)$data['date']) : date('d/m/Y');
            $isPinned = !empty($data['isPinned']) || !empty($data['is_pinned']);

            $article = HomepageArticle::updateOrCreate(
                ['id' => $id],
                [
                    'title' => $title,
                    'category' => $category,
                    'author' => $author,
                    'summary' => $summary,
                    'content' => $content,
                    'cover_image' => $coverImage,
                    'video_url' => $videoUrl,
                    'images' => $images,
                    'date' => $date,
                    'is_pinned' => $isPinned,
                ]
            );

            // Đồng bộ sang System_Settings để duy trì tương thích ngược
            $this->syncArticlesToSettings();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => (string)$article->id,
                    'title' => (string)$article->title,
                    'category' => (string)$article->category,
                    'author' => (string)$article->author,
                    'summary' => (string)$article->summary,
                    'content' => (string)$article->content,
                    'coverImage' => (string)$article->cover_image,
                    'videoUrl' => (string)$article->video_url,
                    'images' => is_array($article->images) ? $article->images : (json_decode($article->images, true) ?: []),
                    'date' => (string)$article->date,
                    'isPinned' => (bool)$article->is_pinned,
                    'createdAt' => (string)$article->created_at,
                    'updatedAt' => (string)$article->updated_at,
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('storeArticle error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/homepage/articles/{id}
     */
    public function destroyArticle($id)
    {
        try {
            $this->ensureHomepageTablesExist();
            HomepageArticle::where('id', $id)->delete();
            $this->syncArticlesToSettings();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            Log::error('destroyArticle error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/homepage/media
     * Lấy kho tư liệu đa phương tiện từ bảng chuyên biệt homepage_media
     */
    public function indexMedia()
    {
        try {
            $this->ensureHomepageTablesExist();

            $mediaList = HomepageMedia::orderBy('created_at', 'desc')
                ->get()
                ->reject(function ($item) {
                    return in_array($item->id, ['med-1', 'med-2', 'med-3', 'med-4', 'med-5', 'med-6']);
                });

            $formatted = $mediaList->values()->map(function ($item) {
                return [
                    'id' => (string)$item->id,
                    'title' => (string)$item->title,
                    'type' => (string)($item->type ?: 'image'),
                    'category' => (string)($item->category ?: 'Toàn CLB'),
                    'mediaUrl' => (string)($item->media_url ?: ''),
                    'thumbnail' => (string)($item->thumbnail ?: ''),
                    'images' => is_array($item->images) ? $item->images : (json_decode($item->images, true) ?: []),
                    'description' => (string)($item->description ?: ''),
                    'date' => (string)($item->date ?: date('d/m/Y')),
                    'createdAt' => (string)$item->created_at,
                    'updatedAt' => (string)$item->updated_at,
                ];
            });

            return response()->json(['success' => true, 'data' => $formatted]);
        } catch (\Throwable $e) {
            Log::error('indexMedia error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/homepage/media
     * Thêm mới hoặc cập nhật 1 mục media trong bảng chuyên biệt homepage_media
     */
    public function storeMedia(Request $request)
    {
        try {
            $this->ensureHomepageTablesExist();

            $data = $request->json()->all();
            if (empty($data)) {
                $data = $request->all();
            }
            if (empty($data)) {
                $raw = $request->getContent();
                if (!empty($raw)) {
                    $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);
                    $data = json_decode($raw, true) ?: [];
                }
            }

            $id = !empty($data['id']) ? trim((string)$data['id']) : ('med-' . time() . '-' . rand(100, 999));
            $title = !empty($data['title']) ? trim((string)$data['title']) : 'Tư liệu mới';
            $type = (!empty($data['type']) && in_array($data['type'], ['image', 'video'])) ? $data['type'] : 'image';
            $category = !empty($data['category']) ? trim((string)$data['category']) : 'Toàn CLB';
            $mediaUrl = isset($data['mediaUrl']) ? (string)$data['mediaUrl'] : (isset($data['media_url']) ? (string)$data['media_url'] : '');
            $thumbnail = isset($data['thumbnail']) ? (string)$data['thumbnail'] : '';
            
            $images = $data['images'] ?? [];
            if (is_string($images)) {
                $images = json_decode($images, true) ?: [];
            }
            if (!is_array($images)) {
                $images = [];
            }

            $description = isset($data['description']) ? (string)$data['description'] : '';
            $date = !empty($data['date']) ? trim((string)$data['date']) : date('d/m/Y');

            $item = HomepageMedia::updateOrCreate(
                ['id' => $id],
                [
                    'title' => $title,
                    'type' => $type,
                    'category' => $category,
                    'media_url' => $mediaUrl,
                    'thumbnail' => $thumbnail,
                    'images' => $images,
                    'description' => $description,
                    'date' => $date,
                ]
            );

            $this->syncMediaToSettings();

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => (string)$item->id,
                    'title' => (string)$item->title,
                    'type' => (string)$item->type,
                    'category' => (string)$item->category,
                    'mediaUrl' => (string)$item->media_url,
                    'thumbnail' => (string)$item->thumbnail,
                    'images' => is_array($item->images) ? $item->images : (json_decode($item->images, true) ?: []),
                    'description' => (string)$item->description,
                    'date' => (string)$item->date,
                    'createdAt' => (string)$item->created_at,
                    'updatedAt' => (string)$item->updated_at,
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('storeMedia error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/homepage/media/{id}
     */
    public function destroyMedia($id)
    {
        try {
            $this->ensureHomepageTablesExist();
            HomepageMedia::where('id', $id)->delete();
            $this->syncMediaToSettings();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            Log::error('destroyMedia error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Đồng bộ bảng homepage_articles sang System_Settings (VMC_HOMEPAGE_ARTICLES)
     */
    private function syncArticlesToSettings()
    {
        try {
            $articles = HomepageArticle::orderBy('is_pinned', 'desc')->orderBy('created_at', 'desc')->get();
            $array = $articles->map(function ($art) {
                return [
                    'id' => $art->id,
                    'title' => $art->title,
                    'category' => $art->category,
                    'author' => $art->author,
                    'summary' => $art->summary,
                    'content' => $art->content,
                    'coverImage' => $art->cover_image,
                    'videoUrl' => $art->video_url,
                    'images' => $art->images,
                    'date' => $art->date,
                    'isPinned' => $art->is_pinned,
                    'viewCount' => $art->view_count,
                ];
            })->toArray();

            SystemSetting::updateOrCreate(
                ['setting_key' => 'VMC_HOMEPAGE_ARTICLES'],
                ['setting_value' => json_encode($array, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]
            );
        } catch (\Throwable $e) {
            // Ignore
        }
    }

    /**
     * Đồng bộ bảng homepage_media sang System_Settings (VMC_HOMEPAGE_MEDIA)
     */
    private function syncMediaToSettings()
    {
        try {
            $media = HomepageMedia::orderBy('created_at', 'desc')->get();
            $array = $media->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'type' => $item->type,
                    'category' => $item->category,
                    'mediaUrl' => $item->media_url,
                    'thumbnail' => $item->thumbnail,
                    'images' => $item->images,
                    'description' => $item->description,
                    'date' => $item->date,
                ];
            })->toArray();

            SystemSetting::updateOrCreate(
                ['setting_key' => 'VMC_HOMEPAGE_MEDIA'],
                ['setting_value' => json_encode($array, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]
            );
        } catch (\Throwable $e) {
            // Ignore
        }
    }
}
