<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InternalAnnouncement;

class AnnouncementController extends Controller
{
    public function index()
    {
        try {
            $announcements = InternalAnnouncement::orderBy('is_pinned', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            $data = $announcements->map(function ($a) {
                return [
                    'id' => $a->id,
                    'title' => $a->title,
                    'content' => $a->content,
                    'author_id' => $a->author_id,
                    'is_pinned' => (bool) $a->is_pinned,
                    'created_at' => $a->created_at,
                ];
            });

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $annId = $request->input('id') ?: ('ann-' . time() . '-' . rand(100, 999));
            $authorId = $request->input('author_id') ?: $request->input('authorId');
            $isPinned = $request->input('is_pinned', false) || $request->input('isPinned', false);

            $ann = InternalAnnouncement::create([
                'id' => $annId,
                'title' => $request->input('title', ''),
                'content' => $request->input('content', ''),
                'author_id' => $authorId ? (string) $authorId : null,
                'is_pinned' => (bool) $isPinned,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $annId,
                    'title' => $ann->title,
                    'content' => $ann->content,
                    'author_id' => $ann->author_id,
                    'is_pinned' => (bool) $ann->is_pinned,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            InternalAnnouncement::where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
