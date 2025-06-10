"use client";

import { useState } from "react";
import { SketchPicker } from "react-color";

export default function ColorPicker() {
  const [color, setColor] = useState("#ff0000");

  return (
    <div className="flex flex-col items-center gap-4">
      <SketchPicker
        color={color}
        onChangeComplete={(newColor) => setColor(newColor.hex)}
      />
      <div className="font-mono text-sm">
        Selected Color: <span className="font-bold">{color}</span>
      </div>
      <div
        className="w-16 h-16 border border-black rounded"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
