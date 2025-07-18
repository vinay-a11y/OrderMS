"use client"

import { Store, Gauge, ShoppingCart, Package, Utensils, Users, BarChart3, Settings, UserCircle } from "lucide-react"
import type { SectionType } from "./admin-dashboard"

interface NavbarProps {
  currentSection: SectionType
  onSectionChange: (section: SectionType) => void
}

export function Navbar({ currentSection, onSectionChange }: NavbarProps) {
  const navItems = [
    { id: "dashboard" as SectionType, label: "Dashboard", icon: Gauge },
    { id: "orders" as SectionType, label: "Orders", icon: ShoppingCart },
    { id: "products" as SectionType, label: "Products", icon: Package },
    { id: "kitchen" as SectionType, label: "Kitchen Prep", icon: Utensils },
    { id: "customers" as SectionType, label: "Customers", icon: Users },
    { id: "analytics" as SectionType, label: "Analytics", icon: BarChart3 },
    { id: "settings" as SectionType, label: "Settings", icon: Settings },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm h-[70px]">
      <div className="max-w-7xl mx-auto px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold text-purple-600">Admin Dashboard</span>
          </div>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    currentSection === item.id
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                      : "text-slate-600 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl text-purple-600">
            <UserCircle className="h-5 w-5" />
            <span className="font-medium">Admin</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
