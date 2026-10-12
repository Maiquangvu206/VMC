<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Equipment;

class EquipmentController extends Controller
{
    public function index()
    {
        try {
            $items = Equipment::orderBy('id', 'asc')->get();
            $data = $items->map(function ($e) {
                return [
                    'id' => $e->id,
                    'code' => $e->code,
                    'name' => $e->name,
                    'category' => $e->category,
                    'condition_status' => $e->condition_status ?: 'Tốt',
                    'status' => $e->status ?: 'available',
                    'borrower_id' => $e->borrower_id,
                    'return_date' => $e->return_date ? substr($e->return_date, 0, 10) : null,
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
            $eqId = $request->input('id') ?: ('eq-' . time() . '-' . rand(100, 999));
            $borrowerId = $request->input('borrower_id');

            $eq = Equipment::create([
                'id' => $eqId,
                'code' => $request->input('code', ''),
                'name' => $request->input('name', ''),
                'category' => $request->input('category'),
                'condition_status' => $request->input('condition_status', 'Tốt'),
                'status' => $request->input('status', 'available'),
                'borrower_id' => $borrowerId ? (string) $borrowerId : null,
                'return_date' => $request->input('return_date'),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $eqId,
                    'code' => $eq->code,
                    'name' => $eq->name,
                    'category' => $eq->category,
                    'condition_status' => $eq->condition_status,
                    'status' => $eq->status,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $eq = Equipment::find($id);
            if (!$eq) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy thiết bị'], 404);
            }

            if ($request->has('status')) $eq->status = $request->input('status');
            if ($request->has('condition_status')) $eq->condition_status = $request->input('condition_status');
            if ($request->has('borrower_id')) $eq->borrower_id = $request->input('borrower_id') ? (string) $request->input('borrower_id') : null;
            if ($request->has('return_date')) $eq->return_date = $request->input('return_date');

            $eq->save();

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
