<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontReport = [];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register()
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        // For API requests, always return JSON
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'error' => $exception->getMessage(),
                'code' => $exception->getCode()
            ], 500);
        }

        return parent::render($request, $exception);
    }
}