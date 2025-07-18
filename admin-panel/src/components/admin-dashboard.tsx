"use client"

import { useState } from "react"
import { Navbar } from "./navbar"
import { OrdersSection } from "./orders-section"
import { ProductsSection } from "./products-section"
import { KitchenSection } from "./kitchen-section"
import { ToastContainer } from "./toast-container"

export type SectionType = "dashboard" | "orders" | "products" | "kitchen" | "customers" | "analytics" | "settings"

export function AdminDashboard() {
  const [currentSection, setCurrentSection] = useState<SectionType>("orders")

  const renderSection = () => {
    switch (currentSection) {
      case "orders":
        return <OrdersSection />
      case "products":
        return <ProductsSection />
      case "kitchen":
        return <KitchenSection />
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-700 mb-2">
                {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} Section
              </h2>
              <p className="text-slate-500">Coming soon!</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentSection={currentSection} onSectionChange={setCurrentSection} />
      <main className="pt-[70px]">{renderSection()}</main>
      <ToastContainer />
    </div>
  )
}
