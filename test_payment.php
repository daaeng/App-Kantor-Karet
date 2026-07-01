<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$req = new Illuminate\Http\Request();
$req->merge([
    'receipt_ids' => [22], 
    'total_amount' => 700000, 
    'source' => 'cash', 
    'payment_date' => '2026-07-01'
]);

$c = app()->make(App\Http\Controllers\RealEstate\MaterialReceiptController::class);

try {
    $response = $c->processPayment($req);
    echo "Success!\n";
    if (method_exists($response, 'getSession')) {
        echo json_encode($response->getSession()->all());
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
