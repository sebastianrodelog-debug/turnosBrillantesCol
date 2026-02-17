import { useState, useCallback, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Sector
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Sparkles, TrendingUp } from "lucide-react";
import { ActivityChart } from "./ActivityChart";
import { cn } from "@/lib/utils";
import { Appointment } from "@/types/business";
import { format, parseISO, startOfMonth, getMonth } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardChartsProps {
  appointments: Appointment[];
}

// Fixed colors for services
const SERVICE_COLORS = [
  "hsl(199, 89%, 48%)",
  "hsl(174, 62%, 47%)",
  "hsl(38, 92%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(262, 83%, 58%)",
  "hsl(346, 77%, 49%)",
];

// Active shape for pie chart with beautiful animations
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      {/* Glow effect */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 12}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.2}
        style={{ filter: 'blur(8px)' }}
      />
      {/* Main sector expanded */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
          transition: 'all 0.3s ease-out'
        }}
      />
      {/* Inner highlight */}
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius + 6}
        outerRadius={innerRadius + 10}
        fill={fill}
        opacity={0.6}
      />
      {/* Center text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-lg font-bold">
        {value}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
        {payload.name}
      </text>
    </g>
  );
};

// Custom bar shape with hover effect
const CustomBar = (props: any) => {
  const { x, y, width, height, fill, isHovered } = props;

  return (
    <g>
      {/* Glow effect when hovered */}
      {isHovered && (
        <rect
          x={x - 4}
          y={y - 4}
          width={width + 8}
          height={height + 8}
          rx={10}
          fill={fill}
          opacity={0.3}
          style={{ filter: 'blur(8px)' }}
        />
      )}
      {/* Main bar */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={fill}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
          transformOrigin: 'bottom',
          filter: isHovered ? 'brightness(1.15) drop-shadow(0 8px 16px rgba(0,0,0,0.2))' : 'none'
        }}
      />
      {/* Top shine effect */}
      {isHovered && (
        <rect
          x={x + 4}
          y={y + 4}
          width={width - 8}
          height={8}
          rx={4}
          fill="white"
          opacity={0.3}
        />
      )}
    </g>
  );
};

export function DashboardCharts({ appointments }: DashboardChartsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  // Process data for charts
  const { serviceData, monthlyData } = useMemo(() => {
    // Service Distribution
    const serviceCounts: Record<string, number> = {};
    appointments.forEach(apt => {
      // Clean up service names if needed or use 'Unknown'
      const name = apt.service || 'Otros';
      serviceCounts[name] = (serviceCounts[name] || 0) + 1;
    });

    const sData = Object.entries(serviceCounts).map(([name, value], index) => ({
      name,
      value,
      color: SERVICE_COLORS[index % SERVICE_COLORS.length]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5

    // Monthly Revenue (last 6 months or current year)
    // Initialize with 0 for last 6 months
    const today = new Date();
    const mLast6 = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
      return {
        date: d,
        name: format(d, 'MMM', { locale: es }),
        ingresos: 0
      };
    });

    appointments.forEach(apt => {
      if (apt.status === 'confirmed' || apt.status === 'completed') {
        try {
          // Parse date properly. apt.date is YYYY-MM-DD
          const aptDate = parseISO(apt.date); // or new Date(apt.date) but parseISO is safer for YYYY-MM-DD
          const aptMonth = getMonth(aptDate);

          // Find matching month in mLast6
          const match = mLast6.find(m => getMonth(m.date) === aptMonth);
          if (match) {
            // Cast to any because we added price to the object but not the interface in this file?
            // Actually Appointment type inside AppointmentCard might not have Price.
            // We need to extend it locally or force cast.
            const price = (apt as any).price || 0;
            match.ingresos += price;
          }
        } catch (e) {
          console.error("Error parsing date for revenue", e);
        }
      }
    });

    return { serviceData: sData, monthlyData: mLast6 };
  }, [appointments]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Dynamic Activity Chart */}
      <ActivityChart appointments={appointments} />

      {/* Services Distribution - Animated Donut */}
      <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card via-card to-accent/5 shadow-xl shadow-accent/5">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
          <div className="absolute top-20 right-16 w-1.5 h-1.5 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-16 left-20 w-1 h-1 bg-success/25 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 relative">
                <Calendar className="h-4 w-4 text-accent" />
                <Sparkles className="h-2.5 w-2.5 text-accent absolute -top-0.5 -right-0.5 animate-pulse" />
              </div>
              Servicios Populares
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {serviceData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <defs>
                    {serviceData.map((entry, index) => (
                      <filter key={`glow-${index}`} id={`glow-${index}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    ))}
                  </defs>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease-out',
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {serviceData.map((service, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-300",
                      activeIndex === index
                        ? "bg-secondary/80 scale-105 shadow-md"
                        : "hover:bg-secondary/50"
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full shadow-lg transition-all duration-300",
                          activeIndex === index && "scale-125"
                        )}
                        style={{
                          backgroundColor: service.color,
                          boxShadow: activeIndex === index ? `0 0 12px ${service.color}, 0 0 0 2px hsl(var(--card)), 0 0 0 4px ${service.color}` : undefined
                        }}
                      />
                      <span className={cn(
                        "text-sm transition-all duration-300",
                        activeIndex === index ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {service.name}
                      </span>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold transition-all duration-300",
                      activeIndex === index ? "text-foreground scale-110" : "text-foreground"
                    )}>
                      {service.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground">
              No hay datos de servicios aún.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Revenue - Interactive Bars */}
      <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-card via-card to-success/5 shadow-xl shadow-success/5 lg:col-span-2">
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-warning/5 pointer-events-none" />
        <CardHeader className="relative pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-success/20 to-success/10">
                <Users className="h-4 w-4 text-success" />
              </div>
              Tendencia Mensual
            </CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Ingresos
              </span>
              {hoveredBar !== null && (
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold animate-fade-in">
                  ${monthlyData[hoveredBar].ingresos.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={monthlyData}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(174, 62%, 47%)" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="colorIngresosHover" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(199, 89%, 58%)" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(174, 62%, 57%)" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Bar
                dataKey="ingresos"
                radius={[8, 8, 0, 0]}
                name="Ingresos"
                animationDuration={1000}
                animationEasing="ease-out"
                shape={(props: any) => (
                  <CustomBar
                    {...props}
                    isHovered={hoveredBar === props.index}
                    fill={hoveredBar === props.index ? "url(#colorIngresosHover)" : "url(#colorIngresos)"}
                  />
                )}
                onMouseEnter={(_, index) => setHoveredBar(index)}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Bottom indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            {monthlyData.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  hoveredBar === index
                    ? "w-8 bg-primary"
                    : "w-2 bg-border hover:bg-muted-foreground"
                )}
                onMouseEnter={() => setHoveredBar(index)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
