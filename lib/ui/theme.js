export const lightTheme = {
    colors: {
        primary: '#6750A4',
        onPrimary: '#FFFFFF',
        primaryContainer: '#EADDFF',
        onPrimaryContainer: '#21005D',
        secondary: '#625B71',
        onSecondary: '#FFFFFF',
        secondaryContainer: '#E8DEF8',
        onSecondaryContainer: '#1D192B',
        error: '#B3261E',
        onError: '#FFFFFF',
        errorContainer: '#F9DEDC',
        onErrorContainer: '#410E0B',
        surface: '#FEF7FF',
        onSurface: '#1D1B20',
        surfaceVariant: '#E7E0EC',
        onSurfaceVariant: '#49454F',
        outline: '#79747E',
        background: '#FEF7FF',
        onBackground: '#1D1B20',
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
        fontSize: '16px',
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },
    shape: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        full: '9999px',
    },
    elevation: {
        0: 'none',
        1: '0 1px 2px rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
        2: '0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
        3: '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)',
    },
};
export const darkTheme = {
    colors: {
        primary: '#D0BCFF',
        onPrimary: '#381E72',
        primaryContainer: '#4F378B',
        onPrimaryContainer: '#EADDFF',
        secondary: '#CCC2DC',
        onSecondary: '#332D41',
        secondaryContainer: '#4A4458',
        onSecondaryContainer: '#E8DEF8',
        error: '#F2B8B5',
        onError: '#601410',
        errorContainer: '#8C1D18',
        onErrorContainer: '#F9DEDC',
        surface: '#141218',
        onSurface: '#E6E0E9',
        surfaceVariant: '#49454F',
        onSurfaceVariant: '#CAC4D0',
        outline: '#938F99',
        background: '#141218',
        onBackground: '#E6E0E9',
    },
    typography: lightTheme.typography,
    spacing: lightTheme.spacing,
    shape: lightTheme.shape,
    elevation: lightTheme.elevation,
};
function deepMerge(base, overrides) {
    const result = { ...base };
    for (const key of Object.keys(overrides)) {
        const ov = overrides[key];
        const bv = base[key];
        if (ov !== undefined && typeof bv === 'object' && bv !== null && typeof ov === 'object') {
            result[key] = deepMerge(bv, ov);
        }
        else if (ov !== undefined) {
            result[key] = ov;
        }
    }
    return result;
}
export function applyTheme(theme, element) {
    const el = element ?? (typeof document !== 'undefined' ? document.documentElement : null);
    if (!el)
        return;
    const c = theme.colors;
    el.style.setProperty('--wj-primary', c.primary);
    el.style.setProperty('--wj-on-primary', c.onPrimary);
    el.style.setProperty('--wj-primary-container', c.primaryContainer);
    el.style.setProperty('--wj-on-primary-container', c.onPrimaryContainer);
    el.style.setProperty('--wj-secondary', c.secondary);
    el.style.setProperty('--wj-on-secondary', c.onSecondary);
    el.style.setProperty('--wj-secondary-container', c.secondaryContainer);
    el.style.setProperty('--wj-on-secondary-container', c.onSecondaryContainer);
    el.style.setProperty('--wj-error', c.error);
    el.style.setProperty('--wj-on-error', c.onError);
    el.style.setProperty('--wj-error-container', c.errorContainer);
    el.style.setProperty('--wj-on-error-container', c.onErrorContainer);
    el.style.setProperty('--wj-surface', c.surface);
    el.style.setProperty('--wj-on-surface', c.onSurface);
    el.style.setProperty('--wj-surface-variant', c.surfaceVariant);
    el.style.setProperty('--wj-on-surface-variant', c.onSurfaceVariant);
    el.style.setProperty('--wj-outline', c.outline);
    el.style.setProperty('--wj-background', c.background);
    el.style.setProperty('--wj-on-background', c.onBackground);
    const t = theme.typography;
    el.style.setProperty('--wj-font-family', t.fontFamily);
    el.style.setProperty('--wj-font-size', t.fontSize);
    const s = theme.spacing;
    el.style.setProperty('--wj-spacing-xs', s.xs);
    el.style.setProperty('--wj-spacing-sm', s.sm);
    el.style.setProperty('--wj-spacing-md', s.md);
    el.style.setProperty('--wj-spacing-lg', s.lg);
    el.style.setProperty('--wj-spacing-xl', s.xl);
    const sh = theme.shape;
    el.style.setProperty('--wj-shape-sm', sh.sm);
    el.style.setProperty('--wj-shape-md', sh.md);
    el.style.setProperty('--wj-shape-lg', sh.lg);
    el.style.setProperty('--wj-shape-full', sh.full);
    const e = theme.elevation;
    el.style.setProperty('--wj-elevation-0', e[0]);
    el.style.setProperty('--wj-elevation-1', e[1]);
    el.style.setProperty('--wj-elevation-2', e[2]);
    el.style.setProperty('--wj-elevation-3', e[3]);
}
export function createTheme(overrides) {
    return deepMerge(lightTheme, overrides);
}
