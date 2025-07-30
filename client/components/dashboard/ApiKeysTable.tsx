import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal } from "lucide-react"

export function ApiKeysTable() {
  return (
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
              <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">Created</TableHead>
              <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">Last Used</TableHead>
              <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">Usage (24h)</TableHead>
              <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-white/80 font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
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
  )
}