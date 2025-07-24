"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Shield, Bell, Lock, ArrowLeft, Camera, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"

export default function ProfilePage() {
  // Mock session data for UI development
  const mockSession = {
    user: {
      name: 'PUPA Admin',
      email: 'admin@pupa.co',
      image: null
    }
  }
  
  // Use real session if available, otherwise use mock data
  const { data: session = mockSession, status } = { data: mockSession, status: 'authenticated' } as any
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "PUPA Company",
    email: "admin@pupa.co",
    phone: "+66 2 123 4567",
    company: "PUPA Technology Co., Ltd.",
    position: "CEO & Founder",
    location: "Bangkok, Thailand",
    bio: "Passionate about building innovative API solutions that help developers create amazing applications.",
    website: "https://pupa.co",
    timezone: "Asia/Bangkok",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    securityAlerts: true,
    marketingEmails: false,
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to your backend
    console.log("Saving profile data:", profileData)
  }

  const handleGoogleSignIn = () => {
    signIn("google")
  }

  const handleSignOut = () => {
    signOut()
  }

  // Show loading state if needed
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
        </div>

        {/* Authentication Status */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Authentication Status</h3>
                  <p className="text-white/70">Signed in as {session?.user?.email || 'demo@example.com'}</p>
                </div>
              </div>
              <div className="flex gap-3">
                {session ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      Sign Out
                    </Button>
                    <span className="text-xs text-yellow-400">(Demo Mode)</span>
                  </div>
                ) : (
                  <Button className="bg-white text-gray-900 hover:bg-gray-100">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 border-4 border-white/20">
                    <AvatarImage src={session?.user?.image || "/placeholder.svg?height=96&width=96"} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white text-2xl font-bold">
                      {profileData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                <h2 className="text-xl font-bold mb-1">{profileData.name}</h2>
                <p className="text-white/70 mb-2">{profileData.position}</p>
                <p className="text-white/60 text-sm mb-4">{profileData.company}</p>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Active
                </Badge>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">API Keys</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Total Requests</span>
                  <span className="font-semibold">1,248</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Member Since</span>
                  <span className="font-semibold">Jun 2023</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-white/10 border border-white/20">
                <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-purple-600">
                  <Lock className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-600">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Personal Information</CardTitle>
                    <Button
                      onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        "Edit Profile"
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={session?.user?.email || profileData.email}
                          disabled={true}
                          className="bg-white/5 border-white/20 text-white opacity-60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={profileData.position}
                          onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          disabled={!isEditing}
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select disabled={!isEditing}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder={profileData.timezone} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                            <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        disabled={!isEditing}
                        className="bg-white/5 border-white/20 text-white min-h-[100px]"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <div className="space-y-6">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <CardTitle>Password & Authentication</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" className="bg-white/5 border-white/20 text-white" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          className="bg-white/5 border-white/20 text-white"
                        />
                      </div>
                      <Button className="bg-purple-600 hover:bg-purple-700">Update Password</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable 2FA</p>
                          <p className="text-sm text-white/70">Add an extra layer of security to your account</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <CardTitle className="text-red-400">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/10">
                          <h4 className="font-medium text-red-400 mb-2">Delete Account</h4>
                          <p className="text-sm text-white/70 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-white/70">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, emailNotifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-white/70">Receive push notifications in your browser</p>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) =>
                          setNotifications({ ...notifications, pushNotifications: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security Alerts</p>
                        <p className="text-sm text-white/70">Get notified about security events</p>
                      </div>
                      <Switch
                        checked={notifications.securityAlerts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, securityAlerts: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-white/70">Receive updates about new features and promotions</p>
                      </div>
                      <Switch
                        checked={notifications.marketingEmails}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                      />
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700">Save Preferences</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
