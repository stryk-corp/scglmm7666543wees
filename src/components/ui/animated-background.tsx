
'use client';

export const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 -z-20 h-full w-full bg-transparent">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,hsl(var(--foreground)/0.025)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.025)_1px,transparent_1px)] bg-[size:18px_28px]" />
            <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.45),transparent_65%)]" />
            <div className="absolute -top-1/2 left-0 h-full w-1/2 bg-[radial-gradient(circle_500px_at_50%_50%,hsl(var(--primary)/0.07),transparent)] animate-blob-1" />
            <div className="absolute -top-1/2 right-0 h-full w-1/2 bg-[radial-gradient(circle_500px_at_50%_50%,hsl(var(--accent)/0.32),transparent)] animate-blob-2" />
        </div>
    );
};
