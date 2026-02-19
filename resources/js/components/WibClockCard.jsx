import React from 'react';
import { clsx } from 'clsx';

export default function WibClockCard({
    city = 'Jakarta',
    timeZone = 'Asia/Jakarta',
    backgroundImageUrl,
    allowBackgroundUpload = false,
    className,
}) {
    const storageKey = `clock_bg_${timeZone}`;
    const [tick, setTick] = React.useState(Date.now());
    const [bg, setBg] = React.useState(() => {
        if (typeof backgroundImageUrl === 'string') return backgroundImageUrl;
        try {
            return localStorage.getItem(storageKey) || '';
        } catch (e) {
            return '';
        }
    });

    React.useEffect(() => {
        const id = setInterval(() => setTick(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    React.useEffect(() => {
        if (typeof backgroundImageUrl === 'string') {
            setBg(backgroundImageUrl);
        }
    }, [backgroundImageUrl]);

    const now = new Date(tick);

    const time = new Intl.DateTimeFormat('id-ID', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(now);

    const date = new Intl.DateTimeFormat('en-US', {
        timeZone,
        weekday: 'long',
        month: 'long',
        day: '2-digit',
        year: 'numeric',
    }).format(now);

    const style = bg
        ? { backgroundImage: `url("${bg}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : undefined;

    const onPickFile = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const url = typeof reader.result === 'string' ? reader.result : '';
            if (!url) return;
            setBg(url);
            try {
                localStorage.setItem(storageKey, url);
            } catch (e) {
                // ignore
            }
        };
        reader.readAsDataURL(file);
    };

    const resetBg = () => {
        setBg('');
        try {
            localStorage.removeItem(storageKey);
        } catch (e) {
            // ignore
        }
    };

    return (
        <div
            className={clsx(
                "mm-elevate mc-panel overflow-hidden",
                className
            )}
            style={style}
        >
            <div className="relative bg-black/25 backdrop-blur-[1px]">
                {allowBackgroundUpload ? (
                    <div className="absolute top-3 right-3 flex gap-2">
                        <label className="px-2 py-1 rounded-md text-[11px] font-black border-2 border-black/60 bg-black/25 text-white/90 hover:bg-black/35 cursor-pointer">
                            Ganti
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onPickFile(e.target.files?.[0])}
                            />
                        </label>
                        <button
                            type="button"
                            onClick={resetBg}
                            className="px-2 py-1 rounded-md text-[11px] font-black border-2 border-black/60 bg-black/25 text-white/90 hover:bg-black/35"
                        >
                            Reset
                        </button>
                    </div>
                ) : null}
                <div className="px-5 pt-4 pb-3 text-center mc-title font-black tracking-wide">
                    {city}
                </div>
                <div className="px-5 pb-4 text-center text-white">
                    <div className="text-6xl leading-none font-light tabular-nums">
                        {time}
                    </div>
                    <div className="mt-2 text-sm mc-muted">
                        {date}
                    </div>
                </div>
            </div>
        </div>
    );
}
