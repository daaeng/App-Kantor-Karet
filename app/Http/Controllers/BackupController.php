<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BackupController extends Controller
{
    public function index()
    {
        $backups = [];
        $disk = Storage::disk('local');
        $path = 'backups';

        if ($disk->exists($path)) {
            $files = $disk->files($path);
            foreach ($files as $file) {
                $backups[] = [
                    'name'       => basename($file),
                    'size'       => $disk->size($file),
                    'created_at' => date('Y-m-d H:i:s', $disk->lastModified($file)),
                    'path'       => $file,
                ];
            }
            // Sort newest first
            usort($backups, fn($a, $b) => strtotime($b['created_at']) - strtotime($a['created_at']));
        }

        return Inertia::render('Backup/Index', [
            'backups' => $backups,
        ]);
    }

    public function create(Request $request)
    {
        try {
            $dbName   = config('database.connections.mysql.database');
            $dbUser   = config('database.connections.mysql.username');
            $dbPass   = config('database.connections.mysql.password');
            $dbHost   = config('database.connections.mysql.host');
            $dbPort   = config('database.connections.mysql.port', '3306');

            $timestamp  = now()->format('Y-m-d_H-i-s');
            $filename   = "backup_{$dbName}_{$timestamp}.sql";
            $backupPath = storage_path('app/backups');

            if (!file_exists($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            $filePath = $backupPath . DIRECTORY_SEPARATOR . $filename;

            // mysqldump command
            if (!empty($dbPass)) {
                $command = "mysqldump --host={$dbHost} --port={$dbPort} --user={$dbUser} --password={$dbPass} {$dbName} > \"{$filePath}\"";
            } else {
                $command = "mysqldump --host={$dbHost} --port={$dbPort} --user={$dbUser} {$dbName} > \"{$filePath}\"";
            }

            $output = [];
            $returnVar = 0;
            exec($command, $output, $returnVar);

            if ($returnVar !== 0 || !file_exists($filePath) || filesize($filePath) === 0) {
                // Fallback: PHP-based backup
                $this->phpBackup($filePath, $dbName);
            }

            return redirect()->route('backup.index')
                ->with('message', "Backup berhasil dibuat: {$filename}");

        } catch (\Exception $e) {
            return redirect()->route('backup.index')
                ->with('error', 'Backup gagal: ' . $e->getMessage());
        }
    }

    public function download(Request $request)
    {
        $filename = $request->query('file');
        $filePath = storage_path('app/backups/' . $filename);

        if (!file_exists($filePath)) {
            abort(404, 'File backup tidak ditemukan.');
        }

        return response()->download($filePath);
    }

    public function destroy(Request $request)
    {
        $filename = $request->query('file');
        $filePath = storage_path('app/backups/' . $filename);

        if (file_exists($filePath)) {
            unlink($filePath);
        }

        return redirect()->route('backup.index')
            ->with('message', 'Backup berhasil dihapus.');
    }

    /**
     * PHP-based SQL backup fallback (no mysqldump required)
     */
    private function phpBackup(string $filePath, string $dbName): void
    {
        $sql = "-- GKA System Database Backup\n";
        $sql .= "-- Generated: " . now()->toDateTimeString() . "\n";
        $sql .= "-- Database: {$dbName}\n\n";
        $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        $tables = DB::select('SHOW TABLES');
        foreach ($tables as $table) {
            $tableName = array_values((array) $table)[0];

            // DROP + CREATE TABLE
            $create = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $createSql = array_values((array) $create[0])[1];
            $sql .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $sql .= $createSql . ";\n\n";

            // INSERT DATA
            $rows = DB::table($tableName)->get();
            if ($rows->count() > 0) {
                $columns = array_keys((array) $rows->first());
                $colList = '`' . implode('`, `', $columns) . '`';

                $sql .= "INSERT INTO `{$tableName}` ({$colList}) VALUES\n";
                $values = [];
                foreach ($rows as $row) {
                    $rowArr = array_map(function ($val) {
                        return $val === null ? 'NULL' : '\'' . addslashes($val) . "'";
                    }, (array) $row);
                    $values[] = '(' . implode(', ', $rowArr) . ')';
                }
                $sql .= implode(",\n", $values) . ";\n\n";
            }
        }

        $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";
        file_put_contents($filePath, $sql);
    }
}
