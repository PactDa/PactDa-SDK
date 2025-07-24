import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Home,
  Shield,
  FileText,
  Settings,
  Plus,
  Search,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  User,
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-70 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen fixed">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <h1 className="text-xl font-bold">Pactda</h1>
            </div>
            <div className="mt-4">
              <Select defaultValue="app1">
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="app1">My Application 1</SelectItem>
                  <SelectItem value="app2">My Application 2</SelectItem>
                  <SelectItem value="app3">+ Create New Application</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <nav className="flex-1 p-6">
            <div className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600/20 text-white font-medium border-l-3 border-purple-600"
              >
                <Home className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <Shield className="w-5 h-5" />
                API Keys
              </Link>
              <Link
                href="/documentation"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <FileText className="w-5 h-5" />
                Documentation
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </div>
          </nav>

          <div className="p-6 border-t border-white/10">
            <Link
              href="/profile"
              className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-2 transition-colors group"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                PU
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm group-hover:text-purple-200">PUPA Company</div>
                <div className="text-gray-400 text-xs opacity-80 group-hover:opacity-100">admin@pupa.co</div>
              </div>
              <User className="w-4 h-4 text-gray-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-70 p-8">
          <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="flex gap-4">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-600/30">
                <Plus className="w-4 h-4 mr-2" />
                New API Key
              </Button>
            </div>
          </header>

          {/* Stats Grid */}
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

          {/* API Keys Table */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:-translate-y-1 transition-transform">
            <CardHeader className="border-b border-white/10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold">API Keys</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                    <Input
                      placeholder="Search keys..."
                      className="pl-10 w-70 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">Name</TableHead>
                    <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">Key</TableHead>
                    <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">
                      Created
                    </TableHead>
                    <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">
                      Last Used
                    </TableHead>
                    <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">
                      Usage (24h)
                    </TableHead>
                    <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white/90">Production Key</TableCell>
                    <TableCell className="font-mono text-sm text-purple-400 font-medium tracking-wide">
                      pk_live_*****89abc
                    </TableCell>
                    <TableCell className="text-white/90">Jun 15, 2023</TableCell>
                    <TableCell className="text-white/90">2 minutes ago</TableCell>
                    <TableCell className="text-white/90">1,248</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white/90">Development Key</TableCell>
                    <TableCell className="font-mono text-sm text-purple-400 font-medium tracking-wide">
                      pk_test_*****45def
                    </TableCell>
                    <TableCell className="text-white/90">May 28, 2023</TableCell>
                    <TableCell className="text-white/90">1 hour ago</TableCell>
                    <TableCell className="text-white/90">342</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableCell className="text-white/90">Legacy Key</TableCell>
                    <TableCell className="font-mono text-sm text-purple-400 font-medium tracking-wide">
                      pk_live_*****12xyz
                    </TableCell>
                    <TableCell className="text-white/90">Apr 10, 2023</TableCell>
                    <TableCell className="text-white/90">3 days ago</TableCell>
                    <TableCell className="text-white/90">89</TableCell>
                    <TableCell>
                      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        Inactive
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-white/60 hover:text-white hover:bg-white/10">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Chart Placeholder */}
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
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-xl text-white py-8 mt-12 border-t border-white/10">
        <div className="container mx-auto px-8 flex justify-between items-center">
          <div className="text-2xl font-bold">Pactda</div>
          <div className="text-sm opacity-80">
            © 2025 Sui Foundation | Documentation distributed under{" "}
            <a href="#" className="text-purple-400 font-medium hover:underline">
              CC BY 4.0
            </a>
          </div>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label="YouTube"
            >
              Y
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label="Discord"
            >
              D
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label="X (Twitter)"
            >
              X
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
