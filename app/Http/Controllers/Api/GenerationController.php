<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Generation;

class GenerationController extends Controller
{
    public function index()
    {
        try {
            $rows = Generation::orderBy('id', 'desc')->get();
            $data = $rows->map(function ($g) {
                return [
                    'id' => $g->id,
                    'name' => $g->name,
                    'years' => $g->years,
                    'description' => $g->description ?: ($g->name . ' (' . ($g->years ?: '') . ')'),
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
            $id = $request->input('id') ?: ('gen-' . time());
            $name = $request->input('name', '');
            $years = $request->input('years', '');
            $description = $request->input('description', '');

            Generation::updateOrCreate(
                ['id' => $id],
                [
                    'name' => $name,
                    'years' => $years,
                    'description' => $description,
                ]
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $id,
                    'name' => $name,
                    'years' => $years,
                    'description' => $description,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            Generation::where('id', $id)->delete();
            return response()->json(['success' => true, 'message' => 'Đã xóa Gen thành công']);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
