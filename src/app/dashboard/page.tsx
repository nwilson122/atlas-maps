"use client"

import { useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/charts/stat-card"
import { AreaChart } from "@/components/charts/area-chart"
import { DonutChart } from "@/components/charts/donut-chart"
import { DataTable } from "@/components/data/data-table"
import { ActivityFeed } from "@/components/data/activity-feed"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, RefreshCw, Calendar, Globe, Database, Map, AlertTriangle } from "lucide-react"
import {
  generateLocationEvents,
  generateEventsByRegion,
  generateGeoActivity,
  SEVERITY_DISTRIBUTION,
} from "@/lib/mock-data"
import { formatCurrency, formatDate, formatRelativeTime, formatNumber } from "@/lib/utils"
import type { StatCard as StatCardType, LocationEvent } from "@/types"
import { cn } from "@/lib/utils"

// ─── Atlas KPI Data ──────────────────────────────────────────────────────────

const KPI_STATS: StatCardType[] = [
  {
    id: "regions",
    title: "Active Regions",
    value: "24",
    rawValue: 24,
    change: 0,
    changeLabel: "monitoring zones",
    icon: "Globe",
    trend: "neutral",
    sparkline: [18, 19, 20, 21, 22, 22, 23, 23, 24, 24, 24, 24],
  },
  {
    id: "events",
    title: "Total Events",
    value: "14,200",
    rawValue: 14200,
    change: 12.4,
    changeLabel: "+1,570 this period",
    icon: "AlertTriangle",
    trend: "up",
    sparkline: [11800, 12100, 12400, 12700, 12900, 13200, 13500, 13700, 13900, 14000, 14100, 14200],
  },
  {
    id: "coverage",
    title: "Coverage",
    value: "87.3%",
    rawValue: 87.3,
    change: 2.1,
    changeLabel: "geographic coverage",
    icon: "Map",
    trend: "up",
    sparkline: [82.1, 83.2, 84.1, 84.9, 85.6, 86.2, 86.8, 87.0, 87.1, 87.2, 87.2, 87.3],
  },
  {
    id: "alertzones",
    title: "Alert Zones",
    value: "8",
    rawValue: 8,
    change: -20.0,
    changeLabel: "active alerts",
    icon: "AlertTriangle",
    trend: "down",
    sparkline: [12, 11, 10, 10, 9, 9, 8, 8, 8, 8, 8, 8],
  },
]

// ─── Location Events table columns ───────────────────────────────────────────

const EVENT_STATUS_STYLES: Record<LocationEvent["status"], { label: string; className: string }> = {
  active: { label: "Active", className: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  resolved: { label: "Resolved", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  investigating: { label: "Investigating", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  acknowledged: { label: "Acknowledged", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
}

const SEVERITY_STYLES: Record<LocationEvent["severity"], { label: string; className: string }> = {
  low: { label: "Low", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  medium: { label: "Medium", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  high: { label: "High", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  critical: { label: "Critical", className: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
}

const eventColumns: ColumnDef<LocationEvent>[] = [
  {
    accessorKey: "id",
    header: "Event ID",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ getValue }) => (
      <span className="text-xs font-medium">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => (
      <span className="text-xs capitalize">{String(getValue())}</span>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ getValue }) => {
      const severity = getValue() as LocationEvent["severity"]
      const cfg = SEVERITY_STYLES[severity]
      return (
        <Badge variant="outline" className={cn("text-[10px] font-medium h-5 px-1.5 border", cfg.className)}>
          {cfg.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "coordinates",
    header: "Coordinates",
    cell: ({ getValue }) => {
      const [lat, lng] = getValue() as [number, number]
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {lat.toFixed(2)}, {lng.toFixed(2)}
        </span>
      )
    },
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatDate(String(getValue()))}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as LocationEvent["status"]
      const cfg = EVENT_STATUS_STYLES[status]
      return (
        <Badge variant="outline" className={cn("text-[10px] font-medium h-5 px-1.5 border", cfg.className)}>
          {cfg.label}
        </Badge>
      )
    },
  },
]

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const locationEvents = useMemo(() => generateLocationEvents(50), [])
  const eventsByRegion = useMemo(() => generateEventsByRegion(), [])
  const geoActivity = useMemo(() => generateGeoActivity(10), [])
  const totalSeverityEvents = SEVERITY_DISTRIBUTION.reduce((s, d) => s + d.value, 0)

  const activityItems = useMemo(() => {
    return geoActivity.map(activity => ({
      id: activity.id,
      type: 'alert' as const,
      title: activity.title,
      description: activity.description,
      timestamp: activity.timestamp,
      metadata: activity.location ? {
        city: activity.location.city,
        region: activity.location.region,
      } : undefined,
    }))
  }, [geoActivity])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atlas — Geographic Intelligence"
        description="Real-time location intelligence and data monitoring across 24 active regions worldwide."
      >
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Calendar className="size-3.5" />
          Last 30 days
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Download className="size-3.5" />
          Export
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-xs">
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </PageHeader>

      {/* ── Row 1: KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_STATS.map((stat, i) => (
          <StatCard key={stat.id} stat={stat} animationDelay={i * 80} />
        ))}
      </div>

      {/* ── Row 2: Global Map + Severity Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Map Placeholder */}
        <Card className="lg:col-span-2 border-border/60 animate-fade-in-up delay-300">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">Global Event Monitoring</CardTitle>
                <CardDescription className="text-xs mt-0.5">Real-time event distribution across monitored regions</CardDescription>
              </div>
              <Tabs defaultValue="events" className="shrink-0">
                <TabsList className="h-7 p-0.5">
                  <TabsTrigger value="events" className="text-[11px] h-6 px-2.5">Events</TabsTrigger>
                  <TabsTrigger value="heatmap" className="text-[11px] h-6 px-2.5">Heatmap</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-4 pr-2">
            {/* Map Placeholder */}
            <div className="w-full h-[260px] bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-lg relative overflow-hidden">
              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(148, 163, 184, 0.5) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148, 163, 184, 0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />

              {/* Simulated data points */}
              <div className="absolute top-12 left-20 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
              <div className="absolute top-16 right-32 w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-300" />
              <div className="absolute bottom-20 left-32 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse delay-700" />
              <div className="absolute top-24 right-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500" />
              <div className="absolute bottom-16 right-16 w-3 h-3 bg-orange-400 rounded-full animate-pulse delay-1000" />
              <div className="absolute top-20 left-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-200" />

              {/* Center overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-slate-300">
                  <Globe className="size-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-medium">Geographic Event Distribution</p>
                  <p className="text-xs text-slate-400 mt-1">24 regions • {formatNumber(locationEvents.length)} events</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution Donut */}
        <Card className="border-border/60 animate-fade-in-up delay-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Event Severity</CardTitle>
            <CardDescription className="text-xs">
              {formatNumber(totalSeverityEvents)} total events
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-4">
            <DonutChart
              data={SEVERITY_DISTRIBUTION}
              height={200}
              innerRadius={65}
              outerRadius={90}
              formatValue={(v) => formatNumber(v)}
              centerValue={formatNumber(totalSeverityEvents)}
              centerLabel="Total"
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Location Data + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Location Data Table */}
        <Card className="lg:col-span-2 border-border/60 animate-fade-in-up delay-400">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Location Events</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Showing the last {locationEvents.length} location events across all regions
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <DataTable
              columns={eventColumns}
              data={locationEvents}
              searchKey="location"
              searchPlaceholder="Search locations..."
            />
          </CardContent>
        </Card>

        {/* Geographic Activity Feed */}
        <Card className="border-border/60 animate-fade-in-up delay-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Geographic Events</CardTitle>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                Live
              </span>
            </div>
            <CardDescription className="text-xs">Real-time location events</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ActivityFeed items={activityItems} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
