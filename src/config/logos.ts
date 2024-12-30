export const LOGO_CONFIG = {
  variants: {
    light: 'https://wttwdqxijxvzylavmsrw.supabase.co/storage/v1/object/public/assets/lienrich-logo.png',
    dark: 'https://wttwdqxijxvzylavmsrw.supabase.co/storage/v1/object/public/assets/lienrich-logo.png'
  },
  sizes: {
    small: {
      width: 28,
      height: 28
    },
    medium: {
      width: 36,
      height: 36
    },
    large: {
      width: 48,
      height: 48
    }
  },
  contexts: {
    header: 'medium' as const,
    sidebar: 'small' as const,
    auth: 'large' as const,
    marketing: 'large' as const
  },
  defaults: {
    size: 'medium',
    variant: 'light',
    alt: 'LiEnrich Logo'
  }
};

export type LogoSize = keyof typeof LOGO_CONFIG.sizes;
export type LogoVariant = keyof typeof LOGO_CONFIG.variants;
export type LogoContext = keyof typeof LOGO_CONFIG.contexts;

export interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  className?: string;
  showText?: boolean;
}

export function getLogoPath(variant: LogoVariant = 'light'): string {
  return LOGO_CONFIG.variants[variant];
}

export function getLogoSize(size: LogoSize = 'medium'): { width: number; height: number } {
  return LOGO_CONFIG.sizes[size];
}

export function getContextSize(context: LogoContext): LogoSize {
  return LOGO_CONFIG.contexts[context];
}
