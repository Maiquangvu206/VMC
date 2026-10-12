<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (!file_exists($indexPath)) {
        $indexPath = base_path('dist/index.html');
    }
    if (file_exists($indexPath)) {
        return response(file_get_contents($indexPath), 200, [
            'Content-Type' => 'text/html; charset=UTF-8'
        ]);
    }
    return view('welcome');
})->where('any', '^(?!api).*$');
