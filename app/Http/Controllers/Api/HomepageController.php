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

            // Map thuộc tính chuẩn camelCase cho giao diện React (không tự ý gen dữ liệu mẫu)
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
     * Thêm mới hoặc cập nhật 1 bài viết trong bảng chuyên biệt Homepage_Articles
     */
    public function storeArticle(Request $request)
    {
        try {
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
     * Lấy kho tư liệu đa phương tiện từ bảng chuyên biệt Homepage_Media (không tự ý gen dữ liệu mẫu)
     */
    public function indexMedia()
    {
        try {
            $mediaList = HomepageMedia::orderBy('created_at', 'desc')->get();

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
     * Thêm mới hoặc cập nhật 1 mục media trong bảng chuyên biệt Homepage_Media
     */
    public function storeMedia(Request $request)
    {
        try {
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
