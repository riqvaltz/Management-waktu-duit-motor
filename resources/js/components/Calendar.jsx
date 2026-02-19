import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { clsx } from 'clsx';

export default function Calendar({ selectedDate, onDateSelect }) {
    const [currentMonth, setCurrentMonth] = React.useState(selectedDate || new Date(2026, 0, 1));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="select-none">
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 rounded-md border-2 border-black/60 bg-black/25 text-white/90 hover:bg-black/35">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-black mc-title tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={nextMonth} className="p-2 rounded-md border-2 border-black/60 bg-black/25 text-white/90 hover:bg-black/35">
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="font-black mc-muted py-2">{day}</div>
                ))}
                {days.map(day => (
                    <button
                        key={day.toString()}
                        onClick={() => onDateSelect(day)}
                        className={clsx(
                            "p-2 rounded-md border-2 border-black/50 transition-colors",
                            !isSameMonth(day, currentMonth) && "text-white/50 bg-black/10",
                            isSameDay(day, selectedDate)
                                ? "bg-yellow-400 text-black hover:bg-yellow-300 font-black shadow-[0_4px_0_rgba(0,0,0,0.35)]"
                                : "text-white/90 bg-black/20 hover:bg-black/30"
                        )}
                    >
                        {format(day, 'd')}
                    </button>
                ))}
            </div>
        </div>
    );
}
