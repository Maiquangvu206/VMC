<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FanpageDraft;
use App\Models\Member;
use App\Services\MailService;

class DraftController extends Controller
{
    public function index()
    {
        try {
            $drafts = FanpageDraft::orderBy('created_at', 'desc')->get();
            $data = $drafts->map(function ($d) {
                return [
                    'id' => $d->id,
                    'title' => $d->title,
                    'contentLink' => $d->content_link,
                    'authorId' => $d->author_id,
                    'status' => $d->status ?: 'pending',
                    'publishDate' => $d->publishDate,
                    'graderId' => $d->graderId,
                    'gradingStatus' => $d->gradingStatus ?: 'none',
                    'content' => $d->content,
                    'author' => $d->author,
                    'createdAt' => $d->created_at,
                    'likesCount' => (int) $d->likes_count,
                    'sharesCount' => (int) $d->shares_count,
                    'commentsCount' => (int) $d->comments_count,
                    'contentScore' => (int) $d->content_score,
                    'finalScore' => (int) $d->final_score,
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
            $draftId = $request->input('id') ?: ('draft-' . time() . '-' . rand(100, 999));
            $autId = $request->input('author_id') ?: $request->input('authorId');
            $grId = $request->input('graderId');

            $draft = FanpageDraft::create([
                'id' => $draftId,
                'title' => $request->input('title', 'Bài viết mới'),
                'content_link' => $request->input('content_link', 'https://facebook.com'),
                'author_id' => $autId ? (string) $autId : null,
                'status' => $request->input('status', 'pending'),
                'publishDate' => $request->input('publishDate'),
                'graderId' => $grId ? (string) $grId : null,
                'gradingStatus' => $request->input('gradingStatus', 'none'),
                'content' => $request->input('content', ''),
                'author' => $request->input('author', ''),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $draftId,
                    'title' => $draft->title,
                    'content' => $draft->content,
                    'author' => $draft->author,
                    'author_id' => $autId,
                    'status' => $draft->status,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $draft = FanpageDraft::find($id);
            if (!$draft) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy bài viết'], 404);
            }

            $fields = [
                'status', 'publishDate', 'graderId', 'gradingStatus', 'title',
                'content', 'content_link', 'author', 'likes_count', 'shares_count',
                'comments_count', 'content_score', 'final_score'
            ];

            $grId = $request->input('graderId');

            foreach ($fields as $f) {
                if ($request->has($f)) {
                    $draft->{$f} = $request->input($f);
                }
            }
            if ($request->has('likesCount')) $draft->likes_count = $request->input('likesCount');
            if ($request->has('sharesCount')) $draft->shares_count = $request->input('sharesCount');
            if ($request->has('commentsCount')) $draft->comments_count = $request->input('commentsCount');
            if ($request->has('contentScore')) $draft->content_score = $request->input('contentScore');
            if ($request->has('finalScore')) $draft->final_score = $request->input('finalScore');

            $draft->save();

            // Send notification email to assigned grader
            if ($grId) {
                $grader = Member::whereRaw('CAST(id AS CHAR) = ?', [(string) $grId])
                    ->orWhere('member_code', (string) $grId)
                    ->first();

                if ($grader && $grader->email) {
                    $postDateStr = $draft->publishDate ? date('H:i d/m/Y', strtotime($draft->publishDate)) : 'Chưa có thông tin';
                    $deadlineStr = $draft->publishDate ? date('H:i d/m/Y', strtotime($draft->publishDate . ' +1 day')) : 'Chưa có thông tin';

                    $html = '
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
                          <h3 style="color: #2563eb;">✍️ Phân Công Chấm Tương Tác Bài Viết</h3>
                          <p>Xin chào <strong>' . htmlspecialchars($grader->full_name) . '</strong>,</p>
                          <p>Bạn vừa được phân công làm người chấm tương tác cho một bài viết trên VMC Portal.</p>
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                          <p><strong>Tiêu đề bài viết:</strong> <strong style="font-size: 15px; color: #1e293b;">' . htmlspecialchars($draft->title) . '</strong></p>
                          <p><strong>Thời gian đăng bài:</strong> <strong style="font-size: 15px; color: #1e293b;">' . htmlspecialchars($postDateStr) . '</strong></p>
                          <p><strong>Hạn chấm điểm:</strong> <strong style="font-size: 15px; color: #dc2626;">' . htmlspecialchars($deadlineStr) . '</strong></p>
                          <p><strong>Nhiệm vụ:</strong> Kiểm tra số lượng Like/Share/Comment và chấm điểm tương tác cho bài viết.</p>
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                          <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                        </div>
                    ';
                    MailService::send($grader->email, '✍️ [VMC Draft] Bạn được phân công chấm tương tác bài viết!', $html);
                }
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
