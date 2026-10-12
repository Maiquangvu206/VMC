<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Finance;
use App\Models\Member;
use App\Services\MailService;
use Illuminate\Support\Facades\DB;

class FinanceController extends Controller
{
    public function index()
    {
        try {
            $records = Finance::orderBy('created_at', 'desc')->get();
            $data = $records->map(function ($r) {
                $d = $r->record_date ?: ($r->date ? substr($r->date, 0, 10) : '');
                $by = $r->recorded_by ?: ($r->logged_by ?: 'Thành viên VMC');
                return [
                    'id' => $r->id,
                    'type' => $r->type,
                    'amount' => (int) $r->amount,
                    'description' => $r->description ?: '',
                    'date' => $d,
                    'record_date' => $d,
                    'recorded_by' => $by,
                    'loggedBy' => $by,
                    'logged_by' => $by,
                    'status' => $r->status ?: 'approved',
                    'createdAt' => $r->created_at,
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
            $finId = $request->input('id') ?: ('fin-' . time() . '-' . rand(100, 999));
            $type = $request->input('type', 'income');
            $amount = (int) $request->input('amount', 0);
            $description = $request->input('description', '');
            $recDate = $request->input('record_date') ?: ($request->input('date') ?: date('Y-m-d'));
            $recBy = $request->input('recorded_by') ?: ($request->input('logged_by') ?: ($request->input('loggedBy') ?: 'Thành viên VMC'));
            $status = $request->input('status', 'approved');

            Finance::create([
                'id' => $finId,
                'type' => $type,
                'amount' => $amount,
                'description' => $description,
                'record_date' => $recDate,
                'recorded_by' => $recBy,
                'date' => $recDate,
                'logged_by' => $recBy,
                'status' => $status,
            ]);

            // If pending, send email notification to Admins / HR department
            if ($status === 'pending') {
                try {
                    $reviewers = Member::where('role', 'admin')
                        ->orWhereRaw("LOWER(department) LIKE '%đối ngoại%'")
                        ->orWhereRaw("LOWER(department) LIKE '%nhân sự%'")
                        ->orWhereRaw("LOWER(department) LIKE '%đn-ns%'")
                        ->get();

                    $emails = $reviewers->pluck('email')->filter()->values()->toArray();
                    if (!empty($emails)) {
                        $typeStr = $type === 'income' ? 'THU' : 'CHI';
                        $amountFormatted = number_format($amount, 0, ',', '.') . ' VND';
                        $html = '
                            <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
                              <h3 style="color: #2563eb;">💰 Yêu cầu duyệt dự trù Kinh phí mới</h3>
                              <p>Một yêu cầu dự trù thu chi vừa được tạo trên hệ thống VMC Portal và đang chờ được bạn duyệt.</p>
                              <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                              <p><strong>Loại giao dịch:</strong> <span style="color: ' . ($type === 'income' ? '#10b981' : '#ef4444') . '; font-weight:bold;">' . $typeStr . '</span></p>
                              <p><strong>Số tiền:</strong> <strong style="font-size: 16px; color: #1e293b;">' . $amountFormatted . '</strong></p>
                              <p><strong>Nội dung:</strong> ' . htmlspecialchars($description) . '</p>
                              <p><strong>Ngày thực hiện:</strong> ' . htmlspecialchars($recDate) . '</p>
                              <p><strong>Người gửi yêu cầu:</strong> ' . htmlspecialchars($recBy) . '</p>
                              <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                              <p style="font-size: 12px; color: #64748b;">Vui lòng đăng nhập hệ thống VMC Portal -> trang Quản Lý Thu Chi để kiểm tra và xác nhận duyệt yêu cầu này.</p>
                            </div>
                        ';
                        MailService::send(implode(',', $emails), '💰 [VMC Finance] Yêu cầu duyệt dự trù kinh phí mới', $html);
                    }
                } catch (\Throwable $mailEx) {
                    \Log::warning('⚠️ Không thể gửi mail thông báo thu chi: ' . $mailEx->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $finId,
                    'type' => $type,
                    'amount' => $amount,
                    'description' => $description,
                    'date' => $recDate,
                    'record_date' => $recDate,
                    'loggedBy' => $recBy,
                    'logged_by' => $recBy,
                    'recorded_by' => $recBy,
                    'status' => $status,
                    'created_at' => now()->toDateTimeString(),
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $fin = Finance::find($id);
            if (!$fin) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy giao dịch'], 404);
            }

            $newStatus = $request->input('status');
            $fin->status = $newStatus;
            $fin->save();

            // Send notification to requester
            try {
                $requester = Member::where('full_name', $fin->recorded_by)
                    ->orWhere('member_code', $fin->recorded_by)
                    ->orWhere('full_name', $fin->logged_by)
                    ->first();

                if ($requester && $requester->email) {
                    $statusStr = $newStatus === 'approved' ? 'Đã được duyệt ✅' : 'Đã bị từ chối ❌';
                    $color = $newStatus === 'approved' ? '#10b981' : '#ef4444';
                    $typeStr = $fin->type === 'income' ? 'THU' : 'CHI';
                    $amountFormatted = number_format($fin->amount, 0, ',', '.') . ' VND';

                    $html = '
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
                          <h3 style="color: ' . $color . ';">💰 Kết quả duyệt yêu cầu Kinh phí</h3>
                          <p>Xin chào <strong>' . htmlspecialchars($requester->full_name) . '</strong>,</p>
                          <p>Yêu cầu dự trù thu chi của bạn trên hệ thống VMC Portal đã được Trưởng Ban duyệt.</p>
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                          <p><strong>Trạng thái duyệt:</strong> <strong style="color: ' . $color . '; font-size: 15px;">' . $statusStr . '</strong></p>
                          <p><strong>Loại giao dịch:</strong> ' . $typeStr . '</p>
                          <p><strong>Số tiền:</strong> ' . $amountFormatted . '</p>
                          <p><strong>Nội dung:</strong> ' . htmlspecialchars($fin->description) . '</p>
                          <p><strong>Ngày thực hiện:</strong> ' . htmlspecialchars($fin->date ?: $fin->record_date ?: '') . '</p>
                          <hr style="border:0; border-top:1px solid #e2e8f0; margin: 15px 0;"/>
                          <p style="font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Đối Ngoại - Nhân Sự | CLB Truyền Thông THPT Vĩnh Bảo (VMC)</strong></p>
                        </div>
                    ';
                    MailService::send($requester->email, '💰 [VMC Finance] Kết quả duyệt yêu cầu dự trù kinh phí: ' . ($newStatus === 'approved' ? 'ĐÃ DUYỆT' : 'TỪ CHỐI'), $html);
                }
            } catch (\Throwable $mailEx) {
                \Log::warning('⚠️ Không thể gửi mail kết quả duyệt thu chi: ' . $mailEx->getMessage());
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            Finance::where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
