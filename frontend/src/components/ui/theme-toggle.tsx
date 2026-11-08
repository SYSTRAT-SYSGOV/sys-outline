import { Moon, Sun } from 'lucide-react';

import { useTheme } from '@/context/ThemeContext';
import { Button } from './button';

/**
 * Alternador entre tema claro institucional e modo escuro de alta tecnologia.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="iconSm"
      className={className}
      onClick={toggleTheme}
      title={isDark ? 'Alternar para tema claro' : 'Alternar para modo escuro'}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? (
        <Sun className="size-4 text-warning transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="size-4 text-muted-foreground transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
    </Button>
  );
}
