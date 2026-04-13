import { subDays, subMonths, format, subHours, subMinutes } from "date-fns"
import type {
  Transaction,
  User,
  ActivityItem,
  DailyAnalytics,
  PageAnalytics,
  TrafficSource,
  DonutSegment,
  LocationData,
  LocationCategory,
  LocationStatus,
  GeoActivity,
  LocationEvent,
  EventSeverity,
  EventType,
  EventStatus,
} from "@/types"

// ─── Seeded random for reproducibility ────────────────────────────────────────

function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const rng = seededRng(42)
const rand = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const randFloat = (min: number, max: number) => Number((rng() * (max - min) + min).toFixed(2))
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)]

// ─── Revenue time series (12 months) ──────────────────────────────────────────

export function generateRevenueData() {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  const baseRevenue = [28000, 32000, 27500, 35000, 41000, 38500, 44000, 47500, 43000, 52000, 58000, 63000]
  const baseExpenses = [18000, 21000, 19500, 22000, 26000, 24000, 27500, 29000, 26000, 31000, 34000, 37000]
  return months.map((month, i) => ({
    date: month,
    revenue: baseRevenue[i] + rand(-1500, 1500),
    expenses: baseExpenses[i] + rand(-800, 800),
    profit: baseRevenue[i] - baseExpenses[i] + rand(-500, 500),
  }))
}

// ─── Daily analytics (30 days) ────────────────────────────────────────────────

export function generateDailyAnalytics(): DailyAnalytics[] {
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    const base = 3200 + i * 180
    return {
      date: format(date, "MMM d"),
      pageViews: base + rand(-400, 600),
      uniqueVisitors: Math.floor((base + rand(-400, 600)) * 0.68),
      sessions: Math.floor((base + rand(-400, 600)) * 0.82),
      bounceRate: randFloat(32, 58),
    }
  })
}

// ─── Donut chart — revenue by category ───────────────────────────────────────

export const REVENUE_BY_CATEGORY: DonutSegment[] = [
  { name: "SaaS Subscriptions", value: 54230, color: "#3b82f6" },
  { name: "Professional Services", value: 23870, color: "#10b981" },
  { name: "Marketplace", value: 14560, color: "#f59e0b" },
  { name: "Add-ons & Upgrades", value: 8940, color: "#8b5cf6" },
  { name: "Other", value: 3420, color: "#06b6d4" },
]

// ─── Transactions ─────────────────────────────────────────────────────────────

const CUSTOMERS = [
  { name: "Acme Corporation", email: "billing@acme.io" },
  { name: "Globex Systems", email: "finance@globex.com" },
  { name: "Initech LLC", email: "accounts@initech.co" },
  { name: "Umbrella Corp", email: "payments@umbrella.dev" },
  { name: "Weyland-Yutani", email: "ar@weyland.tech" },
  { name: "Oscorp Industries", email: "billing@oscorp.io" },
  { name: "Stark Enterprises", email: "ap@stark.com" },
  { name: "Wayne Enterprises", email: "finance@wayne.co" },
  { name: "Cyberdyne Systems", email: "billing@cyberdyne.ai" },
  { name: "Tyrell Corporation", email: "accounts@tyrell.io" },
  { name: "Soylent Corp", email: "billing@soylent.dev" },
  { name: "Nakatomi Trading", email: "finance@nakatomi.jp" },
  { name: "Rekall Industries", email: "ar@rekall.io" },
  { name: "Vandelay Industries", email: "billing@vandelay.com" },
  { name: "Dunder Mifflin", email: "accounts@dundermifflin.co" },
]

const DESCRIPTIONS = [
  "Enterprise Annual License",
  "Professional Seat × 12",
  "Infrastructure Top-up",
  "API Overage Charges",
  "Custom Integration Package",
  "Support Tier Upgrade",
  "White-label License",
  "Onboarding & Setup",
  "Analytics Pro Module",
  "Security Compliance Add-on",
  "SSO Configuration",
  "Data Export Tokens",
  "Priority Support Bundle",
  "Team Workspace (50 seats)",
  "Marketplace Commission",
]

const CATEGORIES: Transaction["category"][] = [
  "software", "software", "infrastructure", "marketing",
  "design", "consulting", "other",
]
const STATUSES: Transaction["status"][] = [
  "completed", "completed", "completed", "pending", "failed", "refunded",
]
const METHODS: Transaction["method"][] = ["card", "wire", "ach", "card", "card"]

export function generateTransactions(count = 50): Transaction[] {
  return Array.from({ length: count }, (_, i) => {
    const customer = pick(CUSTOMERS)
    const daysAgo = rand(0, 60)
    return {
      id: `TXN-${String(10000 + i).padStart(6, "0")}`,
      date: format(subDays(new Date(), daysAgo), "yyyy-MM-dd"),
      description: pick(DESCRIPTIONS),
      amount: randFloat(299, 24999),
      status: pick(STATUSES),
      category: pick(CATEGORIES),
      customer: customer.name,
      customerEmail: customer.email,
      method: pick(METHODS),
    }
  })
}

// ─── Users ────────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Quinn", "Blake",
  "Avery", "Cameron", "Sage", "Devon", "Kendall", "Skyler", "Peyton",
  "Harper", "Finley", "Rowan", "Phoenix", "River",
]
const LAST_NAMES = [
  "Chen", "Park", "Williams", "Johnson", "Martinez", "Thompson", "Garcia",
  "Anderson", "Wilson", "Moore", "Taylor", "Jackson", "White", "Harris",
  "Clark", "Lewis", "Robinson", "Walker", "Hall", "Allen",
]
const DOMAINS = ["acme.io", "globex.com", "initech.co", "stark.com", "wayne.co"]
const ROLES: User["role"][] = ["admin", "editor", "viewer", "billing"]
const STATUSES_USER: User["status"][] = ["active", "active", "active", "inactive", "pending"]
const PLANS: User["plan"][] = ["starter", "pro", "pro", "enterprise"]

export function generateUsers(count = 30): User[] {
  return Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST_NAMES)
    const last = pick(LAST_NAMES)
    const domain = pick(DOMAINS)
    return {
      id: `USR-${String(1000 + i).padStart(5, "0")}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
      role: pick(ROLES),
      status: pick(STATUSES_USER),
      joinedAt: format(subMonths(new Date(), rand(1, 24)), "yyyy-MM-dd"),
      lastSeen: format(subHours(new Date(), rand(0, 168)), "yyyy-MM-dd'T'HH:mm:ss"),
      plan: pick(PLANS),
      revenue: randFloat(500, 48000),
    }
  })
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

export function generateActivityFeed(count = 12): ActivityItem[] {
  const events: Array<{
    type: ActivityItem["type"]
    title: string
    desc: string
  }> = [
    { type: "user_signup", title: "New user registered", desc: "alex.chen@acme.io joined Pro plan" },
    { type: "purchase", title: "New purchase", desc: "Globex Systems upgraded to Enterprise — $12,400/yr" },
    { type: "plan_upgrade", title: "Plan upgraded", desc: "Initech LLC moved from Starter → Pro" },
    { type: "refund", title: "Refund processed", desc: "$2,399 refunded to Oscorp Industries" },
    { type: "deploy", title: "Deployment succeeded", desc: "v4.2.1 deployed to production — 0 errors" },
    { type: "alert", title: "Anomaly detected", desc: "Unusual login from IP 185.220.x.x — blocked" },
    { type: "purchase", title: "New purchase", desc: "Weyland-Yutani signed Enterprise — $48,000/yr" },
    { type: "export", title: "Data exported", desc: "Full transaction export by billing@wayne.co" },
    { type: "user_signup", title: "New user registered", desc: "morgan.taylor@cyberdyne.ai joined Starter" },
    { type: "plan_upgrade", title: "Plan upgraded", desc: "Nakatomi Trading upgraded to Enterprise" },
    { type: "comment", title: "Support ticket resolved", desc: "Ticket #8842 closed — API latency issue" },
    { type: "plan_downgrade", title: "Plan downgraded", desc: "Rekall Industries moved to Starter plan" },
  ]

  return events.slice(0, count).map((e, i) => ({
    id: `ACT-${i + 1}`,
    type: e.type,
    title: e.title,
    description: e.desc,
    timestamp: format(subMinutes(new Date(), i * 18 + rand(2, 15)), "yyyy-MM-dd'T'HH:mm:ss"),
    user: {
      name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    },
  }))
}

// ─── Page analytics ──────────────────────────────────────────────────────────

export const PAGE_ANALYTICS: PageAnalytics[] = [
  { path: "/dashboard", title: "Dashboard Overview", views: 24830, uniqueVisitors: 18420, avgDuration: 287, bounceRate: 22.4, change: 12.3 },
  { path: "/analytics", title: "Analytics", views: 18640, uniqueVisitors: 14290, avgDuration: 342, bounceRate: 18.7, change: 28.1 },
  { path: "/settings", title: "Settings", views: 12310, uniqueVisitors: 9840, avgDuration: 198, bounceRate: 31.2, change: -4.3 },
  { path: "/users", title: "User Management", views: 9870, uniqueVisitors: 7620, avgDuration: 412, bounceRate: 15.8, change: 18.9 },
  { path: "/billing", title: "Billing & Plans", views: 7430, uniqueVisitors: 5890, avgDuration: 264, bounceRate: 27.3, change: 6.4 },
  { path: "/reports", title: "Reports", views: 5820, uniqueVisitors: 4710, avgDuration: 518, bounceRate: 11.2, change: 41.7 },
  { path: "/integrations", title: "Integrations", views: 4290, uniqueVisitors: 3480, avgDuration: 334, bounceRate: 24.6, change: 15.2 },
  { path: "/api-keys", title: "API Keys", views: 3140, uniqueVisitors: 2820, avgDuration: 156, bounceRate: 38.9, change: -9.1 },
]

// ─── Traffic sources ──────────────────────────────────────────────────────────

export const TRAFFIC_SOURCES: TrafficSource[] = [
  { source: "Organic Search", visitors: 38420, percentage: 42.3, change: 18.4 },
  { source: "Direct", visitors: 21840, percentage: 24.1, change: 7.2 },
  { source: "Referral", visitors: 14290, percentage: 15.7, change: 32.8 },
  { source: "Social Media", visitors: 9870, percentage: 10.9, change: -3.4 },
  { source: "Email Campaign", visitors: 4680, percentage: 5.2, change: 22.1 },
  { source: "Paid Search", visitors: 1760, percentage: 1.9, change: -11.7 },
]

// ─── Top pages by views (bar chart) ──────────────────────────────────────────

export function generateTopPagesBarData() {
  return PAGE_ANALYTICS.slice(0, 6).map((p) => ({
    page: p.title.replace(" Overview", "").replace(" Management", ""),
    views: p.views,
    visitors: p.uniqueVisitors,
  }))
}

// ─── Geographic Intelligence Data ─────────────────────────────────────────────

// Data points collected over 30 days
export function generateDataPointsTimeSeries() {
  return Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i)
    const baseDataPoints = 38000 + i * 1200
    return {
      date: format(date, "MMM dd"),
      dataPoints: baseDataPoints + rand(-2000, 4000),
      qualityScore: randFloat(88, 98),
    }
  })
}

// Data density by region over 12 months (stacked area)
export function generateRegionalDensityTimeSeries() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return months.map((month, i) => {
    const growthFactor = 1 + (i * 0.08) // 8% monthly growth trend
    return {
      date: month,
      "Asia-Pacific": Math.round((85000 + rand(-8000, 12000)) * growthFactor),
      "Europe": Math.round((78000 + rand(-6000, 9000)) * growthFactor),
      "Americas": Math.round((62000 + rand(-5000, 8000)) * growthFactor),
      "Middle East": Math.round((32000 + rand(-3000, 5000)) * growthFactor),
      "Africa": Math.round((18000 + rand(-2000, 4000)) * growthFactor),
    }
  })
}

// Category distribution for donut chart (Atlas)
export const CATEGORY_DISTRIBUTION: DonutSegment[] = [
  { name: "Retail", value: 285000, color: "#3b82f6" },
  { name: "Logistics", value: 234000, color: "#10b981" },
  { name: "Real Estate", value: 198000, color: "#f59e0b" },
  { name: "Infrastructure", value: 165000, color: "#8b5cf6" },
  { name: "Environmental", value: 142000, color: "#ef4444" },
  { name: "Demographics", value: 206000, color: "#06b6d4" },
]

// City coordinates database
const CITY_DATA = [
  // Europe
  { city: "London", country: "United Kingdom", region: "Europe" as const, lat: 51.5074, lng: -0.1278 },
  { city: "Paris", country: "France", region: "Europe" as const, lat: 48.8566, lng: 2.3522 },
  { city: "Berlin", country: "Germany", region: "Europe" as const, lat: 52.5200, lng: 13.4050 },
  { city: "Madrid", country: "Spain", region: "Europe" as const, lat: 40.4168, lng: -3.7038 },
  { city: "Rome", country: "Italy", region: "Europe" as const, lat: 41.9028, lng: 12.4964 },
  { city: "Amsterdam", country: "Netherlands", region: "Europe" as const, lat: 52.3676, lng: 4.9041 },
  { city: "Stockholm", country: "Sweden", region: "Europe" as const, lat: 59.3293, lng: 18.0686 },
  { city: "Vienna", country: "Austria", region: "Europe" as const, lat: 48.2082, lng: 16.3738 },

  // Americas
  { city: "New York", country: "United States", region: "Americas" as const, lat: 40.7128, lng: -74.0060 },
  { city: "Los Angeles", country: "United States", region: "Americas" as const, lat: 34.0522, lng: -118.2437 },
  { city: "Toronto", country: "Canada", region: "Americas" as const, lat: 43.6532, lng: -79.3832 },
  { city: "São Paulo", country: "Brazil", region: "Americas" as const, lat: -23.5558, lng: -46.6396 },
  { city: "Mexico City", country: "Mexico", region: "Americas" as const, lat: 19.4326, lng: -99.1332 },
  { city: "Buenos Aires", country: "Argentina", region: "Americas" as const, lat: -34.6037, lng: -58.3816 },
  { city: "Vancouver", country: "Canada", region: "Americas" as const, lat: 49.2827, lng: -123.1207 },
  { city: "Miami", country: "United States", region: "Americas" as const, lat: 25.7617, lng: -80.1918 },

  // Asia-Pacific
  { city: "Tokyo", country: "Japan", region: "Asia-Pacific" as const, lat: 35.6762, lng: 139.6503 },
  { city: "Singapore", country: "Singapore", region: "Asia-Pacific" as const, lat: 1.3521, lng: 103.8198 },
  { city: "Sydney", country: "Australia", region: "Asia-Pacific" as const, lat: -33.8688, lng: 151.2093 },
  { city: "Seoul", country: "South Korea", region: "Asia-Pacific" as const, lat: 37.5665, lng: 126.9780 },
  { city: "Hong Kong", country: "Hong Kong SAR", region: "Asia-Pacific" as const, lat: 22.3193, lng: 114.1694 },
  { city: "Bangkok", country: "Thailand", region: "Asia-Pacific" as const, lat: 13.7563, lng: 100.5018 },
  { city: "Melbourne", country: "Australia", region: "Asia-Pacific" as const, lat: -37.8136, lng: 144.9631 },
  { city: "Mumbai", country: "India", region: "Asia-Pacific" as const, lat: 19.0760, lng: 72.8777 },

  // Middle East
  { city: "Dubai", country: "United Arab Emirates", region: "Middle East" as const, lat: 25.2048, lng: 55.2708 },
  { city: "Tel Aviv", country: "Israel", region: "Middle East" as const, lat: 32.0853, lng: 34.7818 },
  { city: "Riyadh", country: "Saudi Arabia", region: "Middle East" as const, lat: 24.7136, lng: 46.6753 },
  { city: "Doha", country: "Qatar", region: "Middle East" as const, lat: 25.2854, lng: 51.5310 },
  { city: "Kuwait City", country: "Kuwait", region: "Middle East" as const, lat: 29.3759, lng: 47.9774 },
  { city: "Istanbul", country: "Turkey", region: "Middle East" as const, lat: 41.0082, lng: 28.9784 },

  // Africa
  { city: "Lagos", country: "Nigeria", region: "Africa" as const, lat: 6.5244, lng: 3.3792 },
  { city: "Cape Town", country: "South Africa", region: "Africa" as const, lat: -33.9249, lng: 18.4241 },
  { city: "Cairo", country: "Egypt", region: "Africa" as const, lat: 30.0444, lng: 31.2357 },
  { city: "Nairobi", country: "Kenya", region: "Africa" as const, lat: -1.2921, lng: 36.8219 },
  { city: "Casablanca", country: "Morocco", region: "Africa" as const, lat: 33.5731, lng: -7.5898 },
  { city: "Johannesburg", country: "South Africa", region: "Africa" as const, lat: -26.2041, lng: 28.0473 },
]

const LOCATION_CATEGORIES: LocationCategory[] = ["urban", "industrial", "residential", "commercial", "infrastructure", "environmental"]
const LOCATION_STATUSES: LocationStatus[] = ["active", "active", "active", "active", "inactive", "anomaly", "investigating"]

export function generateLocationData(count = 100): LocationData[] {
  return Array.from({ length: count }, (_, i) => {
    const cityData = pick(CITY_DATA)
    const status = pick(LOCATION_STATUSES)
    const isAnomaly = status === "anomaly"

    return {
      id: `LOC-${String(10000 + i).padStart(6, "0")}`,
      region: cityData.region,
      city: cityData.city,
      country: cityData.country,
      latitude: cityData.lat + randFloat(-0.1, 0.1), // Add slight variation
      longitude: cityData.lng + randFloat(-0.1, 0.1),
      value: isAnomaly ? randFloat(150, 500) : randFloat(800, 15000),
      category: pick(LOCATION_CATEGORIES),
      lastUpdated: format(subHours(new Date(), rand(0, 72)), "yyyy-MM-dd'T'HH:mm:ss"),
      status,
      dataPoints: rand(50, 2500),
      confidence: isAnomaly ? randFloat(65, 85) : randFloat(88, 99),
    }
  })
}

// Geographic activity feed
export function generateGeoActivity(count = 12): GeoActivity[] {
  const events: Array<{
    type: GeoActivity["type"]
    title: string
    desc: string
  }> = [
    { type: "data_ingested", title: "New data ingested", desc: "2,847 data points from urban sensors in London" },
    { type: "anomaly_detected", title: "Anomaly detected", desc: "Unusual pattern detected in Mumbai industrial zone" },
    { type: "coverage_expanded", title: "Coverage expanded", desc: "New monitoring stations activated in São Paulo" },
    { type: "region_activated", title: "Region activated", desc: "Eastern Europe monitoring network is now online" },
    { type: "quality_check", title: "Quality check completed", desc: "Singapore data quality verified — 99.2% accuracy" },
    { type: "alert_triggered", title: "Alert triggered", desc: "Environmental threshold exceeded in Lagos" },
    { type: "data_ingested", title: "Bulk data processed", desc: "48,392 historical records integrated from Tokyo" },
    { type: "system_update", title: "System updated", desc: "Infrastructure monitoring enhanced in Dubai" },
    { type: "anomaly_detected", title: "Anomaly resolved", desc: "Cairo commercial zone readings normalized" },
    { type: "coverage_expanded", title: "Network expanded", desc: "New satellite coverage added for Cape Town region" },
    { type: "quality_check", title: "Calibration completed", desc: "Sensor recalibration finished across Berlin network" },
    { type: "region_activated", title: "Region online", desc: "Southeast Asia monitoring grid fully operational" },
  ]

  return events.slice(0, count).map((e, i) => {
    const cityData = pick(CITY_DATA)
    return {
      id: `GEO-${i + 1}`,
      type: e.type,
      title: e.title,
      description: e.desc,
      timestamp: format(subMinutes(new Date(), i * 23 + rand(3, 20)), "yyyy-MM-dd'T'HH:mm:ss"),
      location: {
        city: cityData.city,
        region: cityData.region,
        coordinates: [cityData.lat, cityData.lng] as [number, number],
      },
    }
  })
}

// ─── Location Events for Atlas ───────────────────────────────────────────────

const EVENT_TYPES: EventType[] = ["seismic", "environmental", "infrastructure", "security", "anomaly", "maintenance"]
const EVENT_SEVERITIES: EventSeverity[] = ["low", "low", "medium", "medium", "high", "critical"]
const EVENT_STATUSES: EventStatus[] = ["active", "resolved", "investigating", "acknowledged"]

export function generateLocationEvents(count = 50): LocationEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const cityData = pick(CITY_DATA)
    const severity = pick(EVENT_SEVERITIES)
    const hoursAgo = rand(0, 48)

    return {
      id: `EVT-${String(10000 + i).padStart(6, "0")}`,
      region: cityData.region,
      type: pick(EVENT_TYPES),
      severity,
      coordinates: [
        cityData.lat + randFloat(-0.05, 0.05),
        cityData.lng + randFloat(-0.05, 0.05)
      ] as [number, number],
      timestamp: format(subHours(new Date(), hoursAgo), "yyyy-MM-dd'T'HH:mm:ss"),
      status: pick(EVENT_STATUSES),
      location: `${cityData.city}, ${cityData.country}`,
    }
  })
}

// Events by region for bar chart
export function generateEventsByRegion() {
  return [
    { region: "Asia-Pacific", events: 142, change: 18.2 },
    { region: "Europe", events: 98, change: 7.3 },
    { region: "Americas", events: 89, change: 15.6 },
    { region: "Middle East", events: 34, change: -4.1 },
    { region: "Africa", events: 27, change: 22.8 },
  ]
}

// Severity distribution for donut chart
export const SEVERITY_DISTRIBUTION: DonutSegment[] = [
  { name: "Low", value: 145, color: "#10b981" },
  { name: "Medium", value: 89, color: "#f59e0b" },
  { name: "High", value: 34, color: "#ef4444" },
  { name: "Critical", value: 12, color: "#dc2626" },
]

// ─── Regional Summary Data for Atlas ─────────────────────────────────────────

export interface RegionSummary {
  id: string
  region: string
  country: string
  dataPoints: number
  coverage: number
  lastUpdated: string
  status: LocationStatus
  priority: "low" | "medium" | "high" | "critical"
}

export function generateRegionalSummary(): RegionSummary[] {
  const regions = [
    { region: "Europe", country: "United Kingdom", base: 380000, coverage: 96.8 },
    { region: "Asia-Pacific", country: "Japan", base: 342000, coverage: 94.2 },
    { region: "Americas", country: "United States", base: 295000, coverage: 95.1 },
    { region: "Middle East", country: "UAE", base: 128000, coverage: 91.4 },
    { region: "Africa", country: "South Africa", base: 85000, coverage: 88.7 },
  ]

  const statuses: LocationStatus[] = ["active", "active", "active", "investigating", "anomaly"]
  const priorities: RegionSummary["priority"][] = ["high", "high", "medium", "medium", "critical"]

  return regions.map((r, i) => ({
    id: `REG-${String(1000 + i).padStart(5, "0")}`,
    region: r.region,
    country: r.country,
    dataPoints: r.base + rand(-20000, 30000),
    coverage: r.coverage + randFloat(-2, 3),
    lastUpdated: format(subHours(new Date(), rand(0, 48)), "yyyy-MM-dd'T'HH:mm:ss"),
    status: statuses[i],
    priority: priorities[i],
  }))
}

// Regional comparison data (bar chart)
export function generateRegionalComparison() {
  return [
    { region: "Asia-Pacific", current: 342000, previous: 318000, change: 7.5 },
    { region: "Europe", current: 380000, previous: 365000, change: 4.1 },
    { region: "Americas", current: 295000, previous: 278000, change: 6.1 },
    { region: "Middle East", current: 128000, previous: 119000, change: 7.6 },
    { region: "Africa", current: 85000, previous: 74000, change: 14.9 },
  ]
}

// Time-series trend by region (line chart)
export function generateRegionalTrends() {
  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    return {
      date: format(date, "MMM dd"),
      "Asia-Pacific": 342000 + rand(-15000, 18000),
      "Europe": 380000 + rand(-12000, 15000),
      "Americas": 295000 + rand(-10000, 12000),
      "Middle East": 128000 + rand(-8000, 10000),
      "Africa": 85000 + rand(-6000, 8000),
    }
  })
}

// Data quality heatmap
export function generateDataQualityMap() {
  const regions = ["Europe", "Americas", "Asia-Pacific", "Middle East", "Africa"]
  const metrics = ["Accuracy", "Completeness", "Timeliness", "Consistency"]

  return regions.map(region => ({
    region,
    metrics: metrics.map(metric => ({
      metric,
      score: randFloat(85, 99),
    }))
  }))
}

// Coverage gap analysis
export function generateCoverageGaps() {
  return [
    { region: "Europe", coverage: 96.8, gap: 3.2, priority: "low" as const },
    { region: "Americas", coverage: 95.1, gap: 4.9, priority: "medium" as const },
    { region: "Asia-Pacific", coverage: 94.2, gap: 5.8, priority: "medium" as const },
    { region: "Middle East", coverage: 91.4, gap: 8.6, priority: "high" as const },
    { region: "Africa", coverage: 88.7, gap: 11.3, priority: "critical" as const },
  ]
}
