import {useState, useEffect} from "react";

export type BreakPoint = 'mobile' | 'tablet' | 'desktop';

/* Helper function to set which sidebar should be used based on breakpoints*/
export function useBreakpoint(): BreakPoint {
    // default state desktop
    const [bp, setBp] = useState<BreakPoint>('desktop');

    // on mount check which breakpoint should be used to set sidebar
    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w < 640) setBp('mobile');
            else if (w < 1024) setBp('tablet');
            else setBp('desktop');
        };
        update();
        // listen for changes in view size.
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    return bp;
}