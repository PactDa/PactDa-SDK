import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DashboardSidebar } from '../../components/dashboard/DashboardSidebar';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { ApiKeysTable } from '../../components/dashboard/ApiKeysTable';
import { UsageChart } from '../../components/dashboard/UsageChart';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="flex">
        <DashboardSidebar />
        
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

          <DashboardStats />
          <ApiKeysTable />
          <UsageChart />
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