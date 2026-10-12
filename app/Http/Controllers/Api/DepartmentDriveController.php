<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DepartmentDrive;

class DepartmentDriveController extends Controller
{
    public function index()
    {
        try {
            $rows = DepartmentDrive::orderBy('id', 'asc')->get();
            $data = $rows->map(function ($d) {
                return [
                    'id' => $d->id,
                    'deptName' => $d->dept_name,
                    'link' => $d->drive_link,
                    'driveUrl' => $d->drive_link,
                    'updatedAt' => $d->updated_at,
                ];
            });
            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $link = $request->input('link') ?: $request->input('drive_link');
            DepartmentDrive::where('id', $id)
                ->orWhere('dept_name', $id)
                ->update(['drive_link' => $link]);

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
