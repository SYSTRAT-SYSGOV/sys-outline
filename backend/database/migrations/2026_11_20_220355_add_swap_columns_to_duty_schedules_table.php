<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('duty_schedules', function (Blueprint $table) {
            $table->foreignId('swapped_from_user_id')->nullable()->after('substitute_user_id')->constrained('users')->nullOnDelete();
            $table->timestamp('swapped_at')->nullable()->after('swapped_from_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('duty_schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('swapped_from_user_id');
            $table->dropColumn('swapped_at');
        });
    }
};
