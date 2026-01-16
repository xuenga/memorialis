import React from 'react';
import { Check, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ThemeSelectorProps {
  currentTheme: string;
  onSelect: (theme: string) => void;
  customColors?: any;
  onCustomColorsChange?: (colors: any) => void;
}

export default function ThemeSelector({ currentTheme, onSelect, customColors, onCustomColorsChange }: ThemeSelectorProps) {
  const themes = [
    {
      value: 'classic',
      name: 'Classique',
      colors: {
        primary: '#2f4858',
        accent: '#e0bd3e',
        bg: '#e6e6da'
      }
    },
    {
      value: 'modern',
      name: 'Moderne',
      colors: {
        primary: '#1a1a1a',
        accent: '#3b82f6',
        bg: '#f5f5f5'
      }
    },
    {
      value: 'nature',
      name: 'Nature',
      colors: {
        primary: '#1e4620',
        accent: '#86aa7b',
        bg: '#f0f4f0'
      }
    },
    {
      value: 'elegant',
      name: 'Élégant',
      colors: {
        primary: '#4a3347',
        accent: '#c7a2c3',
        bg: '#faf8f9'
      }
    },
    {
      value: 'custom',
      name: 'Perso',
      colors: {
        primary: customColors?.primary || '#2f4858',
        accent: customColors?.accent || '#e0bd3e',
        bg: customColors?.bg || '#e6e6da'
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => onSelect(theme.value)}
            className={`relative p-5 rounded-[2rem] border-2 transition-all group ${currentTheme === theme.value
              ? 'border-accent bg-accent/5'
              : 'border-primary/5 hover:border-accent/40 bg-background'
              }`}
          >
            {currentTheme === theme.value && (
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg border-2 border-white">
                <Check className="w-4 h-4 text-primary" />
              </div>
            )}

            <div className="flex -space-x-2 mb-4 justify-center">
              <div
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.colors.accent }}
              />
              <div
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.colors.bg }}
              />
            </div>

            <p className="text-xs font-bold text-primary uppercase tracking-widest">{theme.name}</p>
          </button>
        ))}
      </div>

      {/* Custom Theme Editor */}
      {currentTheme === 'custom' && onCustomColorsChange && (
        <div className="bg-white rounded-[2rem] border border-primary/5 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Palette className="w-6 h-6 text-accent" />
            <h4 className="font-serif text-xl text-primary font-medium">Couleurs personnalisées</h4>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label>Fond</Label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={customColors?.bg || '#e6e6da'}
                  onChange={(e) => onCustomColorsChange({ ...customColors, bg: e.target.value })}
                  className="w-16 h-12 p-1 cursor-pointer rounded-xl border-primary/10"
                />
                <Input
                  type="text"
                  value={customColors?.bg || '#e6e6da'}
                  onChange={(e) => onCustomColorsChange({ ...customColors, bg: e.target.value })}
                  className="flex-1 rounded-xl"
                  placeholder="#e6e6da"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Texte principal</Label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={customColors?.primary || '#2f4858'}
                  onChange={(e) => onCustomColorsChange({ ...customColors, primary: e.target.value })}
                  className="w-16 h-12 p-1 cursor-pointer rounded-xl border-primary/10"
                />
                <Input
                  type="text"
                  value={customColors?.primary || '#2f4858'}
                  onChange={(e) => onCustomColorsChange({ ...customColors, primary: e.target.value })}
                  className="flex-1 rounded-xl"
                  placeholder="#2f4858"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Accentuation</Label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={customColors?.accent || '#e0bd3e'}
                  onChange={(e) => onCustomColorsChange({ ...customColors, accent: e.target.value })}
                  className="w-16 h-12 p-1 cursor-pointer rounded-xl border-primary/10"
                />
                <Input
                  type="text"
                  value={customColors?.accent || '#e0bd3e'}
                  onChange={(e) => onCustomColorsChange({ ...customColors, accent: e.target.value })}
                  className="flex-1 rounded-xl"
                  placeholder="#e0bd3e"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
