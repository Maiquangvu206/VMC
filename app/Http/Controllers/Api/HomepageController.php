<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HomepageArticle;
use App\Models\HomepageMedia;
use App\Models\SystemSetting;
use Illuminate\Support\Str;

class HomepageController extends Controller
{
    /**
     * GET /api/homepage/articles
     * Lấy danh sách bài viết từ bảng chuyên biệt Homepage_Articles
     */
    public function indexArticles()
    {
        try {
            $articles = HomepageArticle::orderBy('is_pinned', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            // Nếu bảng chưa có bản ghi, lấy fallback từ System_Settings
            if ($articles->isEmpty()) {
                $setting = SystemSetting::where('setting_key', 'VMC_HOMEPAGE_ARTICLES')->first();
                if ($setting && !empty($setting->setting_value) && $setting->setting_value !== '[]') {
                    $decoded = json_decode($setting->setting_value, true);
                    if (!empty($decoded) && is_array($decoded)) {
                        return response()->json(['success' => true, 'data' => $decoded]);
                    }
                }
            }

            // Map thuộc tính chuẩn camelCase cho giao diện React
            $formatted = $articles->map(function ($art) {
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
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/homepage/articles
     * Thêm mới hoặc cập nhật 1 bài viết trong bảng chuyên biệt
     */
    public function storeArticle(Request $request)
    {
        try {
            $id = $request->input('id') ?: ('art-' . time() . '-' . rand(100, 999));
            $title = $request->input('title', 'Bài viết mới');
            $category = $request->input('category', 'Hoạt động nổi bật');
            $author = $request->input('author', 'Ban Biên Tập VMC');
            $summary = $request->input('summary', '');
            $content = $request->input('content', '');
            $coverImage = $request->input('coverImage') ?: $request->input('cover_image', '');
            $videoUrl = $request->input('videoUrl') ?: $request->input('video_url', null);
            $images = $request->input('images', []);
            $date = $request->input('date') ?: date('d/m/Y');
            $isPinned = filter_var($request->input('isPinned', $request->input('is_pinned', false)), FILTER_VALIDATE_BOOLEAN);

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
                    'images' => is_array($images) ? $images : (json_decode($images, true) ?: []),
                    'date' => $date,
                    'is_pinned' => $isPinned,
                ]
            );

            // Đồng bộ sang System_Settings để duy trì tương thích ngược
            $this->syncArticlesToSettings();

            return response()->json(['success' => true, 'data' => $article]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/homepage/articles/{id}
     */
    public function destroyArticle($id)
    {
        try {
            HomepageArticle::where('id', $id)->delete();
            $this->syncArticlesToSettings();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/homepage/media
     * Lấy kho tư liệu đa phương tiện từ bảng chuyên biệt Homepage_Media
     */
    public function indexMedia()
    {
        try {
            $mediaList = HomepageMedia::orderBy('created_at', 'desc')->get();

            // Nếu bảng chưa có, lấy từ System_Settings
            if ($mediaList->isEmpty()) {
                $setting = SystemSetting::where('setting_key', 'VMC_HOMEPAGE_MEDIA')->first();
                if ($setting && !empty($setting->setting_value) && $setting->setting_value !== '[]') {
                    $decoded = json_decode($setting->setting_value, true);
                    if (!empty($decoded) && is_array($decoded)) {
                        return response()->json(['success' => true, 'data' => $decoded]);
                    }
                }
            }

            $formatted = $mediaList->map(function ($item) {
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
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * POST /api/homepage/media
     */
    public function storeMedia(Request $request)
    {
        try {
            $id = $request->input('id') ?: ('med-' . time() . '-' . rand(100, 999));
            $title = $request->input('title', 'Tư liệu mới');
            $type = $request->input('type', 'image');
            $category = $request->input('category', 'Toàn CLB');
            $mediaUrl = $request->input('mediaUrl') ?: $request->input('media_url', '');
            $thumbnail = $request->input('thumbnail', '');
            $images = $request->input('images', []);
            $description = $request->input('description', '');
            $date = $request->input('date') ?: date('d/m/Y');

            $item = HomepageMedia::updateOrCreate(
                ['id' => $id],
                [
                    'title' => $title,
                    'type' => $type,
                    'category' => $category,
                    'media_url' => $mediaUrl,
                    'thumbnail' => $thumbnail,
                    'images' => is_array($images) ? $images : (json_decode($images, true) ?: []),
                    'description' => $description,
                    'date' => $date,
                ]
            );

            $this->syncMediaToSettings();

            return response()->json(['success' => true, 'data' => $item]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/homepage/media/{id}
     */
    public function destroyMedia($id)
    {
        try {
            HomepageMedia::where('id', $id)->delete();
            $this->syncMediaToSettings();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Đồng bộ bảng Homepage_Articles sang System_Settings (VMC_HOMEPAGE_ARTICLES)
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
     * Đồng bộ bảng Homepage_Media sang System_Settings (VMC_HOMEPAGE_MEDIA)
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
