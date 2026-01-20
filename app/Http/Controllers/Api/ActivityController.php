<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        $date = Carbon::parse($validated['date'])->toDateString();

        $activities = Activity::where('user_id', Auth::id())
            ->whereDate('date', $date)
            ->orderBy('start_time')
            ->orderBy('created_at')
            ->get()
            ->map(function (Activity $a) {
                return [
                    'id' => $a->id,
                    'date' => Carbon::parse($a->date)->toDateString(),
                    'start_time' => substr((string) $a->start_time, 0, 5),
                    'end_time' => substr((string) $a->end_time, 0, 5),
                    'title' => $a->title,
                    'notes' => $a->notes,
                    'completed_at' => optional($a->completed_at)->toISOString(),
                    'created_at' => optional($a->created_at)->toISOString(),
                    'updated_at' => optional($a->updated_at)->toISOString(),
                ];
            })
            ->values();

        return response()->json($activities);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'title' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $activity = Auth::user()->activities()->create([
            'date' => Carbon::parse($validated['date'])->toDateString(),
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'title' => $validated['title'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'id' => $activity->id,
            'date' => Carbon::parse($activity->date)->toDateString(),
            'start_time' => substr((string) $activity->start_time, 0, 5),
            'end_time' => substr((string) $activity->end_time, 0, 5),
            'title' => $activity->title,
            'notes' => $activity->notes,
            'completed_at' => optional($activity->completed_at)->toISOString(),
            'created_at' => optional($activity->created_at)->toISOString(),
            'updated_at' => optional($activity->updated_at)->toISOString(),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $activity = Activity::where('user_id', Auth::id())->find($id);
        if (!$activity) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'title' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $activity->update([
            'date' => Carbon::parse($validated['date'])->toDateString(),
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'title' => $validated['title'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'id' => $activity->id,
            'date' => Carbon::parse($activity->date)->toDateString(),
            'start_time' => substr((string) $activity->start_time, 0, 5),
            'end_time' => substr((string) $activity->end_time, 0, 5),
            'title' => $activity->title,
            'notes' => $activity->notes,
            'completed_at' => optional($activity->completed_at)->toISOString(),
            'created_at' => optional($activity->created_at)->toISOString(),
            'updated_at' => optional($activity->updated_at)->toISOString(),
        ]);
    }

    public function setCompleted(Request $request, $id)
    {
        $activity = Activity::where('user_id', Auth::id())->find($id);
        if (!$activity) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'completed' => 'required|boolean',
        ]);

        $activity->completed_at = $validated['completed'] ? now() : null;
        $activity->save();

        return response()->json([
            'id' => $activity->id,
            'date' => Carbon::parse($activity->date)->toDateString(),
            'start_time' => substr((string) $activity->start_time, 0, 5),
            'end_time' => substr((string) $activity->end_time, 0, 5),
            'title' => $activity->title,
            'notes' => $activity->notes,
            'completed_at' => optional($activity->completed_at)->toISOString(),
            'created_at' => optional($activity->created_at)->toISOString(),
            'updated_at' => optional($activity->updated_at)->toISOString(),
        ]);
    }

    public function destroy($id)
    {
        $activity = Activity::where('user_id', Auth::id())->find($id);
        if (!$activity) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $activity->delete();
        return response()->json(['message' => 'Deleted successfully'], 200);
    }
}
