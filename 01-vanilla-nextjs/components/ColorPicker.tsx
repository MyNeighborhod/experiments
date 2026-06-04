"use client";

import { useState } from "react";

// Helper to convert hex to RGB
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `${r}, ${g}, ${b}`;
};

// Helper to convert hex to HSL
const hexToHsl = (hex: string) => {
  let r = (parseInt(hex.slice(1, 3), 16) || 0) / 255;
  let g = (parseInt(hex.slice(3, 5), 16) || 0) / 255;
  let b = (parseInt(hex.slice(5, 7), 16) || 0) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)}°, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
};

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#18181b", "#71717a"
];

export default function ColorPicker() {
  const [color, setColor] = useState("#3b82f6");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleColorChange = (newColor: string) => {
    // This runs strictly on the client (browser) when you interact with the component
    console.log(`🎨 [Client Interactivity] Color changed to: ${newColor}`);
    setColor(newColor);
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(format);
    setTimeout(() => setCopiedText(null), 1500);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">🎨 Interactive Color Picker</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Input and Swatches */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-500 mb-2">Custom Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 bg-transparent"
              />
              <span className="font-mono text-zinc-700 dark:text-zinc-300 font-semibold">{color.toUpperCase()}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-500 mb-2">Preset Swatches</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleColorChange(preset)}
                  style={{ backgroundColor: preset }}
                  className={`w-8 h-8 rounded-full border transition-transform hover:scale-110 active:scale-95 ${color.toLowerCase() === preset.toLowerCase()
                      ? "border-zinc-950 dark:border-white scale-110 shadow-sm"
                      : "border-transparent"
                    }`}
                  aria-label={`Select color ${preset}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preview and Codes */}
        <div className="space-y-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-zinc-150 dark:border-zinc-800 pt-4 md:pt-0 md:pl-6">
          <div className="flex flex-col gap-4">
            <div
              style={{ backgroundColor: color }}
              className="w-full h-24 rounded-xl shadow-inner border border-black/10 transition-colors duration-200"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-500">HEX</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">{color.toUpperCase()}</span>
                  <button
                    onClick={() => copyToClipboard(color.toUpperCase(), "HEX")}
                    className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                  >
                    {copiedText === "HEX" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-500">RGB</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">rgb({hexToRgb(color)})</span>
                  <button
                    onClick={() => copyToClipboard(`rgb(${hexToRgb(color)})`, "RGB")}
                    className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                  >
                    {copiedText === "RGB" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-500">HSL</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">hsl({hexToHsl(color)})</span>
                  <button
                    onClick={() => copyToClipboard(`hsl(${hexToHsl(color)})`, "HSL")}
                    className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                  >
                    {copiedText === "HSL" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
