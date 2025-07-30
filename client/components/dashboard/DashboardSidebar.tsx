import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Home,
  Shield,
  FileText,
  Settings,
  User,
} from "lucide-react"
import Link from "next/link"

export function DashboardSidebar() {
  return (
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
  )
}