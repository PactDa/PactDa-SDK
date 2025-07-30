import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 border-t-4 border-t-purple-600 hover:-translate-y-1 transition-transform">
        <CardContent className="p-8">
          <div className="text-3xl font-bold mb-2">1,248</div>
          <div className="text-white/80 text-sm font-medium mb-3">Total API Calls</div>
          <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            +12% from last month
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-xl border-white/20 border-t-4 border-t-green-500 hover:-translate-y-1 transition-transform">
        <CardContent className="p-8">
          <div className="text-3xl font-bold mb-2">94.7%</div>
          <div className="text-white/80 text-sm font-medium mb-3">Success Rate</div>
          <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            +2.3% from last month
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-xl border-white/20 border-t-4 border-t-yellow-500 hover:-translate-y-1 transition-transform">
        <CardContent className="p-8">
          <div className="text-3xl font-bold mb-2">4,892</div>
          <div className="text-white/80 text-sm font-medium mb-3">Remaining Credits</div>
          <div className="flex items-center gap-1 text-red-400 text-xs font-medium">
            <TrendingDown className="w-3 h-3" />
            -12% from last week
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-xl border-white/20 border-t-4 border-t-blue-500 hover:-translate-y-1 transition-transform">
        <CardContent className="p-8">
          <div className="text-3xl font-bold mb-2">24ms</div>
          <div className="text-white/80 text-sm font-medium mb-3">Avg. Response Time</div>
          <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            -5% from last week
          </div>
        </CardContent>
      </Card>
    </div>
  )
}