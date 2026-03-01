export type Theme = {
    colors: {
        primary: string;
        onPrimary: string;
        primaryContainer: string;
        onPrimaryContainer: string;
        secondary: string;
        onSecondary: string;
        secondaryContainer: string;
        onSecondaryContainer: string;
        error: string;
        onError: string;
        errorContainer: string;
        onErrorContainer: string;
        surface: string;
        onSurface: string;
        surfaceVariant: string;
        onSurfaceVariant: string;
        outline: string;
        background: string;
        onBackground: string;
    };
    typography: {
        fontFamily: string;
        fontSize: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    shape: {
        sm: string;
        md: string;
        lg: string;
        full: string;
    };
    elevation: {
        0: string;
        1: string;
        2: string;
        3: string;
    };
};
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
export declare const lightTheme: Theme;
export declare const darkTheme: Theme;
export declare function applyTheme(theme: Theme, element?: HTMLElement): void;
export declare function createTheme(overrides: DeepPartial<Theme>): Theme;
export {};
