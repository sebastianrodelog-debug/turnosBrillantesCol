import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, LineChartIcon, Activity, Target, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Appointment } from "@/types/business";
import { format, isSameDay, isSameWeek, isSameMonth, parseISO, getDay, getHours, startOfWeek, endOfWeek, eachDayOfInterval, getWeekOfMonth } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityChartProps {
  appointments: Appointment[];
}

type TimePeriod = "day" | "week" | "month";
type ChartType = "area" | "line" | "bar" | "radar" | "scatter";
type ColorTheme = "ocean" | "sunset" | "forest" | "purple" | "rose";

const colorThemes: Record<ColorTheme, { primary: string; secondary: string; name: string }> = {
  ocean: { primary: "199, 89%, 48%", secondary: "174, 62%, 47%", name: "Océano" },
  sunset: { primary: "25, 95%, 53%", secondary: "38, 92%, 50%", name: "Atardecer" },
  forest: { primary: "142, 71%, 45%", secondary: "168, 76%, 42%", name: "Bosque" },
  purple: { primary: "262, 83%, 58%", secondary: "280, 65%, 60%", name: "Púrpura" },
  rose: { primary: "346, 77%, 49%", secondary: "0, 84%, 60%", name: "Rosa" },
};

const periodLabels: Record<TimePeriod, string> = {
  day: "Hoy",
  week: "Semana",
  month: "Mes",
};

const chartTypeIcons: Record<ChartType, React.ReactNode> = {
  area: <Activity className="h-3.5 w-3.5" />,
  line: <LineChartIcon className="h-3.5 w-3.5" />,
  bar: <BarChart3 className="h-3.5 w-3.5" />,
  radar: <Target className="h-3.5 w-3.5" />,
  scatter: <TrendingUp className="h-3.5 w-3.5" />,
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-2xl animate-scale-in">
        <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ActivityChart({ appointments = [] }: ActivityChartProps) {
  const [period, setPeriod] = useState<TimePeriod>("week");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("ocean");
  const [animationKey, setAnimationKey] = useState(0);

  const colors = colorThemes[colorTheme];
  const primaryColor = `hsl(${colors.primary})`;
  const secondaryColor = `hsl(${colors.secondary})`;

  const processedData = useMemo(() => {
    const today = new Date();

    // --- Day Data (Hourly) ---
    // Initialize hours 8am to 8pm (20:00)
    const dayData = Array.from({ length: 13 }, (_, i) => {
      const hour = i + 8;
      return {
        name: `${hour}hs`,
        hour: hour,
        turnos: 0,
        clientes: 0,
        uniqueClients: new Set<string>()
      };
    });

    // --- Week Data (Mon-Sun) ---
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const daysInterval = eachDayOfInterval({ start, end });

    const weekData = daysInterval.map(d => ({
      name: format(d, 'EEE', { locale: es }), // Lun, Mar, etc.
      dayNum: getDay(d), // 0=Sun, 1=Mon...
      dateStr: format(d, "yyyy-MM-dd"),
      turnos: 0,
      clientes: 0,
      uniqueClients: new Set<string>()
    }));

    // --- Month Data (Weeks 1-5 or similar) ---
    // Simple 4-5 weeks bucket
    const monthData = [
      { name: "Sem 1", turnos: 0, clientes: 0, uniqueClients: new Set<string>() },
      { name: "Sem 2", turnos: 0, clientes: 0, uniqueClients: new Set<string>() },
      { name: "Sem 3", turnos: 0, clientes: 0, uniqueClients: new Set<string>() },
      { name: "Sem 4", turnos: 0, clientes: 0, uniqueClients: new Set<string>() },
      { name: "Sem 5", turnos: 0, clientes: 0, uniqueClients: new Set<string>() },
    ];

    appointments.forEach(apt => {
      try {
        const aptDate = parseISO(apt.date);

        // 1. Fill Day Data (if today)
        if (isSameDay(aptDate, today)) {
          // Parse time "HH:mm"
          const [h] = apt.time.split(':').map(Number);
          const hourEntry = dayData.find(d => d.hour === h);
          if (hourEntry) {
            hourEntry.turnos += 1;
            hourEntry.uniqueClients.add(apt.clientId === 'guest' ? apt.phone : apt.clientId);
          }
        }

        // 2. Fill Week Data (if same week)
        if (isSameWeek(aptDate, today, { weekStartsOn: 1 })) {
          const dayStr = format(aptDate, "yyyy-MM-dd");
          const weekEntry = weekData.find(d => d.dateStr === dayStr);
          if (weekEntry) {
            weekEntry.turnos += 1;
            weekEntry.uniqueClients.add(apt.clientId === 'guest' ? apt.phone : apt.clientId);
          }
        }

        // 3. Fill Month Data (if same month)
        if (isSameMonth(aptDate, today)) {
          const weekNum = getWeekOfMonth(aptDate, { weekStartsOn: 1 });
          // weekNum is usually 1-5 or 1-6
          const index = Math.min(weekNum - 1, 4); // clamp to 0-4
          if (monthData[index]) {
            monthData[index].turnos += 1;
            monthData[index].uniqueClients.add(apt.clientId === 'guest' ? apt.phone : apt.clientId);
          }
        }

      } catch (e) {
        console.error("Error processing appointment for chart", e);
      }
    });

    // Finalize counts (set size to number)
    const finalizedDay = dayData.map(d => ({ ...d, clientes: d.uniqueClients.size }));
    const finalizedWeek = weekData.map(d => ({ ...d, clientes: d.uniqueClients.size }));
    const finalizedMonth = monthData.filter(d => d.turnos > 0 || true).map(d => ({ ...d, clientes: d.uniqueClients.size })); // could filter empty weeks if desired

    return { day: finalizedDay, week: finalizedWeek, month: finalizedMonth };

  }, [appointments]);

  const getData = () => {
    switch (period) {
      case "day": return processedData.day;
      case "week": return processedData.week;
      case "month": return processedData.month;
    }
  };

  const handleChange = (setter: any, value: any) => {
    setter(value);
    setAnimationKey(prev => prev + 1);
  };

  const renderChart = () => {
    const data = getData();
    const commonProps = {
      data,
    };

    switch (chartType) {
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`colorTurnos-${animationKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`colorClientes-${animationKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={secondaryColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={secondaryColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="turnos"
              stroke={primaryColor}
              strokeWidth={2.5}
              fill={`url(#colorTurnos-${animationKey})`}
              name="Turnos"
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="clientes"
              stroke={secondaryColor}
              strokeWidth={2.5}
              fill={`url(#colorClientes-${animationKey})`}
              name="Clientes"
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        );

      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="turnos"
              stroke={primaryColor}
              strokeWidth={3}
              dot={{ fill: primaryColor, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, fill: primaryColor, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              name="Turnos"
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="clientes"
              stroke={secondaryColor}
              strokeWidth={3}
              dot={{ fill: secondaryColor, strokeWidth: 2, r: 5 }}
              activeDot={{ r: 8, fill: secondaryColor, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              name="Clientes"
              animationDuration={800}
              animationEasing="ease-out"
            />
          </LineChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            <defs>
              <linearGradient id={`barTurnos-${animationKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity={1} />
                <stop offset="100%" stopColor={primaryColor} stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id={`barClientes-${animationKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={secondaryColor} stopOpacity={1} />
                <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="turnos"
              fill={`url(#barTurnos-${animationKey})`}
              radius={[6, 6, 0, 0]}
              name="Turnos"
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="clientes"
              fill={`url(#barClientes-${animationKey})`}
              radius={[6, 6, 0, 0]}
              name="Clientes"
              animationDuration={800}
              animationEasing="ease-out"
            />
          </BarChart>
        );

      case "radar":
        return (
          <RadarChart {...commonProps} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <PolarRadiusAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Turnos"
              dataKey="turnos"
              stroke={primaryColor}
              fill={primaryColor}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Radar
              name="Clientes"
              dataKey="clientes"
              stroke={secondaryColor}
              fill={secondaryColor}
              fillOpacity={0.3}
              strokeWidth={2}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </RadarChart>
        );

      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              name="Turnos"
              dataKey="turnos"
              fill={primaryColor}
              animationDuration={800}
              animationEasing="ease-out"
            />
            <Scatter
              name="Clientes"
              dataKey="clientes"
              fill={secondaryColor}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </ScatterChart>
        );
    }
  };

  return (
    <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <CardHeader className="relative pb-3">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div
                className="p-2 rounded-lg transition-all duration-300"
                style={{ background: `linear-gradient(135deg, ${primaryColor}33, ${primaryColor}1a)` }}
              >
                <TrendingUp className="h-4 w-4" style={{ color: primaryColor }} />
              </div>
              Actividad
            </CardTitle>
            <span className="text-xs text-success font-medium bg-success/10 px-2 py-1 rounded-full">+12.5%</span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Period Selector */}
            <div className="flex bg-secondary/50 rounded-lg p-0.5 gap-0.5">
              {(["day", "week", "month"] as TimePeriod[]).map((p) => (
                <Button
                  key={p}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChange(setPeriod, p)}
                  className={cn(
                    "h-7 px-3 text-xs font-medium transition-all duration-300",
                    period === p
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {periodLabels[p]}
                </Button>
              ))}
            </div>

            {/* Chart Type Selector */}
            <div className="flex bg-secondary/50 rounded-lg p-0.5 gap-0.5">
              {(["area", "line", "bar", "radar", "scatter"] as ChartType[]).map((type) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleChange(setChartType, type)}
                  className={cn(
                    "h-7 w-7 p-0 transition-all duration-300",
                    chartType === type
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {chartTypeIcons[type]}
                </Button>
              ))}
            </div>

            {/* Color Theme Selector */}
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <Palette className="h-3.5 w-3.5 text-muted-foreground ml-1" />
              {(Object.keys(colorThemes) as ColorTheme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleChange(setColorTheme, theme)}
                  className={cn(
                    "w-5 h-5 rounded-full transition-all duration-300 border-2",
                    colorTheme === theme
                      ? "border-foreground scale-110 shadow-lg"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ background: `linear-gradient(135deg, hsl(${colorThemes[theme].primary}), hsl(${colorThemes[theme].secondary}))` }}
                  title={colorThemes[theme].name}
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div
          key={animationKey}
          className="animate-fade-in"
        >
          <ResponsiveContainer width="100%" height={220}>
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span className="text-xs text-muted-foreground">Turnos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <span className="text-xs text-muted-foreground">Clientes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
