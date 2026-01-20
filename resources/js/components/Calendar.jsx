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
                <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-200">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-extrabold text-slate-100 tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-full text-slate-200">
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="font-semibold text-slate-400 py-2">{day}</div>
                ))}
                {days.map(day => (
                    <button
                        key={day.toString()}
                        onClick={() => onDateSelect(day)}
                        className={clsx(
                            "p-2 rounded-lg transition-colors",
                            !isSameMonth(day, currentMonth) && "text-slate-500",
                            isSameDay(day, selectedDate)
                                ? "bg-gradient-to-br from-cyan-600 to-blue-700 text-white hover:from-cyan-500 hover:to-blue-600 font-bold shadow"
                                : "text-slate-200 hover:bg-white/5"
                        )}
                    >
                        {format(day, 'd')}
                    </button>
                ))}
            </div>
        </div>
    );
}
