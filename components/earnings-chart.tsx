"use client";

import { Box } from "@mui/material";
import { useThemeMode } from "@/lib/contexts/ThemeContext";
import { getColors } from "@/theme/colors";
import Typography from "@/components/ui/Typography";

interface DataPoint {
  label: string;
  value: number;
}

interface EarningsChartProps {
  data: DataPoint[];
  height?: number;
}

export default function EarningsChart({ data, height = 180 }: EarningsChartProps) {
  const { mode } = useThemeMode();
  const colors = getColors(mode);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const width = 100;
  const padding = { top: 5, bottom: 20, left: 5, right: 5 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - (d.value / maxValue) * (chartH - 5);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  return (
    <Box sx={{ width: "100%" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding.left}
            y1={padding.top + chartH - ratio * (chartH - 5)}
            x2={width - padding.right}
            y2={padding.top + chartH - ratio * (chartH - 5)}
            stroke={colors.chart.grid}
            strokeWidth={0.3}
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={colors.chart.fill} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={colors.chart.line} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2} fill={colors.chart.line} stroke={colors.bgCard} strokeWidth={1} />
        ))}

        {/* Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 3}
            textAnchor="middle"
            fill={colors.textSecondary}
            fontSize={3.5}
            fontWeight={500}
          >
            {p.label}
          </text>
        ))}
      </svg>
    </Box>
  );
}
