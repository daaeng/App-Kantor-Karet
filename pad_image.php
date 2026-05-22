<?php
$inputFile = __DIR__ . '/public/assets/gka_logo.png';
$outputFile = __DIR__ . '/public/assets/gka_logo_square.png';

if (!file_exists($inputFile)) {
    echo "Input file not found.\n";
    exit(1);
}

$img = imagecreatefrompng($inputFile);
if (!$img) {
    echo "Failed to load PNG.\n";
    exit(1);
}

$width = imagesx($img);
$height = imagesy($img);
$max = max($width, $height);

$square = imagecreatetruecolor($max, $max);
// Make background transparent
imagealphablending($square, false);
imagesavealpha($square, true);
$transparent = imagecolorallocatealpha($square, 255, 255, 255, 127);
imagefilledrectangle($square, 0, 0, $max, $max, $transparent);

// Calculate center offset
$offsetX = ($max - $width) / 2;
$offsetY = ($max - $height) / 2;

// Copy image
imagecopy($square, $img, $offsetX, $offsetY, 0, 0, $width, $height);

// Save image
if (imagepng($square, $outputFile)) {
    echo "Success: $outputFile created.\n";
} else {
    echo "Failed to save PNG.\n";
}

imagedestroy($img);
imagedestroy($square);
