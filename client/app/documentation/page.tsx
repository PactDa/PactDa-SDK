import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Menu, Key, ExternalLink, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function Documentation() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">Pactda</div>
          <nav className="flex gap-8">
            <Link
              href="#guides"
              className="text-white hover:underline font-medium transition-all hover:-translate-y-0.5"
            >
              Guides
            </Link>
            <Link
              href="#concept"
              className="text-white hover:underline font-medium transition-all hover:-translate-y-0.5"
            >
              Concept
            </Link>
            <Link
              href="#references"
              className="text-white hover:underline font-medium transition-all hover:-translate-y-0.5"
            >
              References
            </Link>
          </nav>
          <form className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input type="search" placeholder="Search ..." className="pl-10 bg-white/90 border-gray-300" />
            </div>
            <Button type="submit" className="bg-white text-blue-800 hover:bg-gray-100">
              <Search className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex min-h-[calc(100vh-70px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-8 border-r border-gray-200 shadow-sm">
          <div className="space-y-1">
            <div className="p-3 cursor-pointer font-medium border-l-3 border-transparent hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-600 hover:text-white transition-all rounded-r">
              Overview
            </div>
            <div className="p-3 cursor-pointer font-medium border-l-3 border-transparent hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-600 hover:text-white transition-all rounded-r">
              Developer Guides
            </div>
            <div className="p-3 cursor-pointer font-medium border-l-3 border-transparent hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-600 hover:text-white transition-all rounded-r">
              Pactda 101
            </div>
            <div className="p-3 cursor-pointer font-medium border-l-3 border-transparent hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-600 hover:text-white transition-all rounded-r">
              Pactda API
            </div>
            <div className="p-3 cursor-pointer font-medium border-l-3 border-transparent hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-600 hover:text-white transition-all rounded-r">
              Advanced Topics
            </div>
            <div className="p-3 cursor-pointer font-medium border-l-3 border-transparent hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-600 hover:text-white transition-all rounded-r">
              App Examples
            </div>
            <div className="p-3 cursor-pointer font-medium border-l-3 border-transparent hover:bg-gradient-to-r hover:from-blue-800 hover:to-blue-600 hover:text-white transition-all rounded-r">
              Operator Guides
            </div>
            <div className="p-3 cursor-pointer font-medium border-l-3 border-transparent hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-400 hover:text-white transition-all rounded-r">
              FAQ
            </div>
          </div>

          <div className="mt-8 pt-8 border-t-2 border-gradient-to-r from-blue-500 to-green-500 relative">
            <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-500"></div>
            <div className="text-lg font-bold mb-4 px-8 text-blue-800 flex items-center gap-2">
              <span className="text-xl">🚀</span>
              Pactda Portal
            </div>
            <Card className="mx-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 hover:scale-105 cursor-pointer group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-45 from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
              <CardContent className="p-4 flex items-center gap-3 relative z-10">
                <Key className="w-6 h-6 text-blue-500 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
                <span className="font-semibold text-blue-800 group-hover:text-blue-900 transition-colors">
                  Create API Keys
                </span>
                <ExternalLink className="w-4 h-4 text-green-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                <Badge className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full group-hover:scale-110 transition-transform duration-300 animate-glow">
                  NEW
                </Badge>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8">
          <div className="flex">
            <div className="flex-1">
              <Card className="bg-white shadow-lg border-0 rounded-xl">
                <CardContent className="p-8">
                  <h1 className="text-3xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h1>
                  <p className="text-gray-600 mb-8">This section contains common questions and answers about Pactda.</p>

                  <div className="space-y-6">
                    <div className="p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <h3 className="font-semibold text-lg mb-2">What is Pactda?</h3>
                      <p className="text-gray-600">
                        Pactda is a powerful API platform that helps developers build and manage their applications with
                        ease.
                      </p>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border-l-4 border-green-500">
                      <h3 className="font-semibold text-lg mb-2">How do I get started?</h3>
                      <p className="text-gray-600">
                        You can get started by creating an account and generating your first API key from the dashboard.
                      </p>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                      <h3 className="font-semibold text-lg mb-2">What are the rate limits?</h3>
                      <p className="text-gray-600">
                        Rate limits vary by plan. Check your dashboard for specific limits and usage statistics.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <Button className="bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table of Contents */}
            <div className="w-50 ml-8">
              <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-800">
                    <Menu className="w-5 h-5 text-blue-500" />
                    On this page
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 cursor-pointer hover:text-blue-800 hover:pl-2 transition-all">
                      What is Pactda?
                    </div>
                    <div className="text-sm text-gray-600 cursor-pointer hover:text-blue-800 hover:pl-2 transition-all">
                      How do I get started?
                    </div>
                    <div className="text-sm text-gray-600 cursor-pointer hover:text-blue-800 hover:pl-2 transition-all">
                      Rate limits
                    </div>
                    <div className="text-sm text-gray-600 cursor-pointer hover:text-blue-800 hover:pl-2 transition-all">
                      API Documentation
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-4 justify-center mt-12">
            <Link href="/">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 bg-transparent"
              >
                Back to Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-900 hover:to-blue-700 text-white px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-8 flex justify-between items-center">
          <div className="text-2xl font-bold">Pactda</div>
          <div className="text-sm opacity-80">
            © 2025 Sui Foundation | Documentation distributed under{" "}
            <a href="#" className="text-white underline hover:text-blue-200">
              CC BY 4.0
            </a>
          </div>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-800 font-bold hover:bg-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg"
              aria-label="YouTube"
            >
              Y
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-800 font-bold hover:bg-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg"
              aria-label="Discord"
            >
              D
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-800 font-bold hover:bg-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg"
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
