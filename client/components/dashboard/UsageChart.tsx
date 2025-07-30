import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function UsageChart() {
  return (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20 mt-8 hover:-translate-y-1 transition-transform">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-xl font-semibold">API Usage Chart</CardTitle>
      </CardHeader>
      <CardContent className="p-8 h-87 flex items-center justify-center">
        <div className="text-center text-white/70">
          <p className="mb-3 font-medium text-lg">Chart visualization will be displayed here</p>
          <small className="text-sm opacity-80">Interactive charts showing API usage trends</small>
        </div>
      </CardContent>
      <div className="p-6 border-t border-white/10 bg-white/3 flex justify-between items-center">
        <div className="flex gap-12">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-white/70 font-medium">Total Credits</div>
            <div className="font-bold text-white text-lg">10,000</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs text-white/70 font-medium">Used Credits</div>
            <div className="font-bold text-white text-lg">5,108</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs text-white/70 font-medium">Remaining</div>
            <div className="font-bold text-white text-lg">4,892</div>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
          View Details
        </Button>
      </div>
    </Card>
  )
}