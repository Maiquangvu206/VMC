<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Resource;

class ResourceController extends Controller
{
    public function index()
    {
        try {
            $rows = Resource::orderBy('created_at', 'desc')->get();
            $data = $rows->map(function ($r) {
                return [
                    'id' => $r->id,
                    'title' => $r->title,
                    'description' => $r->description,
                    'category' => $r->category,
                    'link' => $r->link,
                    'uploaderId' => $r->uploader_id,
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
            $id = $request->input('id') ?: ('res-' . time() . '-' . rand(100, 999));
            $upId = $request->input('uploaderId') ?: $request->input('uploader_id');

            $res = Resource::create([
                'id' => $id,
                'title' => $request->input('title', ''),
                'description' => $request->input('description', ''),
                'category' => $request->input('category', 'Chung'),
                'link' => $request->input('link', ''),
                'uploader_id' => $upId ? (string) $upId : null,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $id,
                    'title' => $res->title,
                    'description' => $res->description,
                    'category' => $res->category,
                    'link' => $res->link,
                    'uploaderId' => $res->uploader_id,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            Resource::where('id', $id)->delete();
            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
