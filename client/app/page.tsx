import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4">
        <div className="container mx-auto px-5 flex justify-between items-center">
          <div className="text-2xl font-bold">Pactda</div>
          <nav className="flex gap-8">
            <Link href="#guides" className="text-white hover:underline font-medium">
              Guides
            </Link>
            <Link href="#concept" className="text-white hover:underline font-medium">
              Concept
            </Link>
          </nav>
          <div className="flex gap-4">
            <Button className="bg-white text-blue-800 hover:bg-gray-100 rounded-full px-6">Get started</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-5">
        <main className="py-15">
          {/* Hero Section */}
          <section className="text-center mb-20">
            <h1 className="text-5xl font-bold mb-5 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Pactda Documentation
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Discover the power of Sui through examples, guides, and concepts
            </p>
          </section>

          {/* Content Cards */}
          <div className="bg-white/5 rounded-xl p-10 mb-8 border border-white/10 backdrop-blur-sm min-h-[200px] flex items-center justify-center text-white/60 text-lg transition-all duration-300 hover:bg-white/8 hover:-translate-y-1">
            <div>Documentation content will be displayed here</div>
          </div>

          {/* Why Pactda Section */}
          <section className="mb-15">
            <h2 className="text-4xl font-bold text-center mb-4">Why Pactda?</h2>
            <p className="text-center text-white/80 mb-10">
              Discover the power of Sui through examples, guides, and concepts
            </p>

            <div className="bg-white/5 rounded-xl p-10 mb-8 border border-white/10 backdrop-blur-sm min-h-[200px] flex items-center justify-center text-white/60 text-lg transition-all duration-300 hover:bg-white/8 hover:-translate-y-1">
              <div>Learn about the benefits and features of Pactda</div>
            </div>

            <div className="flex min-h-[300px] rounded-xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-br from-blue-400 to-cyan-400 flex-1 flex items-center justify-center text-white text-lg font-medium">
                <div>Interactive Examples</div>
              </div>
              <div className="bg-white/5 flex-[2] flex items-center justify-center text-white/60 text-lg backdrop-blur-sm">
                <div>Comprehensive guides and tutorials</div>
              </div>
            </div>
          </section>

          {/* Navigation Links */}
          <div className="flex gap-4 justify-center mt-12">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/documentation">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-3 bg-transparent"
              >
                View Documentation
              </Button>
            </Link>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-blue-800 text-white py-8 mt-12">
        <div className="container mx-auto px-5 flex justify-between items-center">
          <div className="text-2xl font-bold">Pactda</div>
          <div className="text-sm opacity-80">
            © 2025 Sui Foundation | Documentation distributed under{" "}
            <a href="#" className="text-white underline">
              CC BY 4.0
            </a>
          </div>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-800 font-bold hover:bg-gray-100 transition-colors"
              aria-label="YouTube"
            >
              Y
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-800 font-bold hover:bg-gray-100 transition-colors"
              aria-label="Discord"
            >
              D
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-800 font-bold hover:bg-gray-100 transition-colors"
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
