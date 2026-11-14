<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

/**
 * Seed the reference/lookup data that the UI depends on.
 *
 * The original schema migration only inserted these rows inside the
 * `if (!Schema::hasTable(...))` blocks. On databases where the tables already
 * existed (for example a dump imported into Supabase) they stayed empty, which
 * left dropdowns such as "Thế Hệ" with no options.
 *
 * This migration is idempotent and defensive:
 *  - it accepts both the PascalCase names used by the schema migration and the
 *    lowercase names used by externally created tables;
 *  - it only inserts columns that actually exist;
 *  - a failure on one table does not abort the others (or the transaction).
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->seed('Generations', [
            ['id' => 'gen-8', 'name' => 'Gen 8', 'years' => '2026-2027', 'description' => '🌱 Gen 8 (2026 - 2027)'],
            ['id' => 'gen-7', 'name' => 'Gen 7', 'years' => '2025-2026', 'description' => '🌿 Gen 7 (2025 - 2026)'],
            ['id' => 'gen-6', 'name' => 'Gen 6', 'years' => '2024-2025', 'description' => '✨ Gen 6 (2024 - 2025)'],
            ['id' => 'gen-5', 'name' => 'Gen 5', 'years' => '2023-2024', 'description' => '🎓 Gen 5 (2023 - 2024)'],
            ['id' => 'gen-4', 'name' => 'Gen 4', 'years' => '2022-2023', 'description' => '🏆 Gen 4 (2022 - 2023)'],
            ['id' => 'gen-3', 'name' => 'Gen 3', 'years' => '2021-2022', 'description' => '👑 Gen 3 (2021 - 2022)'],
            ['id' => 'gen-2', 'name' => 'Gen 2', 'years' => '2020-2021', 'description' => '🚀 Gen 2 (2020 - 2021)'],
            ['id' => 'gen-1', 'name' => 'Gen 1', 'years' => '2020-2021', 'description' => '🌟 Gen 1 (2020 - 2021)'],
        ]);

        $this->seed('Department_Drives', [
            ['id' => 'drive-bcn', 'dept_name' => 'Ban Chủ Nhiệm', 'drive_link' => 'https://drive.google.com'],
            ['id' => 'drive-cv', 'dept_name' => 'Ban Cố Vấn', 'drive_link' => 'https://drive.google.com'],
            ['id' => 'drive-dnns', 'dept_name' => 'Ban Đối Ngoại - Nhân Sự', 'drive_link' => 'https://drive.google.com'],
            ['id' => 'drive-sx', 'dept_name' => 'Ban Sản Xuất Media', 'drive_link' => 'https://drive.google.com'],
            ['id' => 'drive-ndpt', 'dept_name' => 'Ban Nội Dung - Phát Thanh', 'drive_link' => 'https://drive.google.com'],
        ]);

        $this->seed('System_Settings', [
            ['setting_key' => 'recruitment_season_active', 'setting_value' => '0'],
        ]);
    }

    public function down(): void
    {
        // Keep seeded data.
    }

    /**
     * Insert rows into the first existing variant of the given table.
     *
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function seed(string $table, array $rows): void
    {
        // Some externally created tables use lowercase names (see the homepage
        // tables), so fill every existing variant; the API keeps using the
        // PascalCase name, and seeding both keeps the data where it is read.
        $candidates = array_values(array_unique([$table, strtolower($table)]));
        $found = false;

        foreach ($candidates as $tableName) {
            if (!Schema::hasTable($tableName)) {
                continue;
            }

            $found = true;

            try {
                $columns = Schema::getColumnListing($tableName);
                if (!$columns) {
                    continue;
                }

                $filtered = array_map(
                    fn (array $row) => array_intersect_key($row, array_flip($columns)),
                    $rows
                );
                $filtered = array_values(array_filter($filtered, fn (array $row) => $row !== []));

                if ($filtered !== []) {
                    DB::table($tableName)->insertOrIgnore($filtered);
                }
            } catch (\Throwable $e) {
                // Never let a seeding problem roll back the schema migrations.
                Log::warning("Seed of {$tableName} failed: {$e->getMessage()}");
            }
        }

        if (!$found) {
            Log::warning("Seed skipped: no variant of {$table} exists.");
        }
    }
};
