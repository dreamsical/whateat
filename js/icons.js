/* ============================================================
   WhatEat — SVG Icon Components
   Uses React.createElement so this file needs NO Babel transform.
   All icons are exposed as globals for use in app.js.
   ============================================================ */

const Heart = ({ size = 24, fill = 'none', stroke = 'currentColor', ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill, stroke, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })
    );

const MapPin = ({ size = 24, ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' }),
        React.createElement('circle', { cx: 12, cy: 10, r: 3 })
    );

const Filter = ({ size = 24, ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' })
    );

const Settings = ({ size = 24, ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('circle', { cx: 12, cy: 12, r: 3 }),
        React.createElement('path', { d: 'M12 1v6m0 6v6m-9-9h6m6 0h6' })
    );

const Sparkles = ({ size = 24, ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }),
        React.createElement('path', { d: 'M5 3v4' }),
        React.createElement('path', { d: 'M19 17v4' }),
        React.createElement('path', { d: 'M3 5h4' }),
        React.createElement('path', { d: 'M17 19h4' })
    );

const Shuffle = ({ size = 24, style, ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style, ...props },
        React.createElement('polyline', { points: '16 3 21 3 21 8' }),
        React.createElement('line', { x1: 4, y1: 20, x2: 21, y2: 3 }),
        React.createElement('polyline', { points: '21 16 21 21 16 21' }),
        React.createElement('line', { x1: 15, y1: 15, x2: 21, y2: 21 }),
        React.createElement('line', { x1: 4, y1: 4, x2: 9, y2: 9 })
    );

const Star = ({ size = 24, fill = 'none', stroke = 'currentColor', ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill, stroke, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
    );

const ChevronRight = ({ size = 24, ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('polyline', { points: '9 18 15 12 9 6' })
    );

const Plus = ({ size = 24, ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
        React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
    );

const Search = ({ size = 24, ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
        React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 })
    );

const ChevronDown = ({ size = 24, ...props }) =>
    React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props },
        React.createElement('polyline', { points: '6 9 12 15 18 9' })
    );
