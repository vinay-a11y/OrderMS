"use client"

import { useState, useEffect, useCallback } from "react"
import { Utensils, Flame, Weight, ListChecks, RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/types/orders"

interface KitchenItem {
  name: string
  totalQuantity: number
  totalWeight: number
  orderCount: number
  variants: { variant: string; quantity: number }[]
  priority: "high" | "medium" | "low"
  estimatedPrepTime: number
}

export function KitchenSection() {
  const [kitchenData, setKitchenData] = useState<KitchenItem[]>([])
  const [statusFilter, setStatusFilter] = useState("confirmed,inprocess")
  const [isLoading, setIsLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

  const { toast } = useToast()


  const loadOrders = useCallback(
  async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)

      const response = await fetch("http://139.59.2.94:8000/api/admin/orders")
      const fetchedOrders: Order[] = await response.json()

      if (!response.ok || !Array.isArray(fetchedOrders)) {
        throw new Error("Failed to fetch orders")
      }

      setOrders(fetchedOrders)

      if (!silent) {
        toast({
          title: "Orders Loaded",
          description: "Successfully fetched orders from backend",
        })
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        })
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  },
  [toast]
)



  // Calculate kitchen preparation data
  const calculateKitchenPrep = useCallback(
    (orders: Order[]) => {
      const statusFilters = statusFilter.split(",")
      const activeOrders = orders.filter((order) => statusFilters.includes(order.order_status))

      const itemMap = new Map<
        string,
        {
          name: string
          totalQuantity: number
          totalWeight: number
          orderCount: number
          variants: Map<string, number>
          orders: Set<number>
        }
      >()

      // Aggregate items from all active orders
      activeOrders.forEach((order) => {
        order.items.forEach((item) => {
          const key = item.name
          if (!itemMap.has(key)) {
            itemMap.set(key, {
              name: item.name,
              totalQuantity: 0,
              totalWeight: 0,
              orderCount: 0,
              variants: new Map(),
              orders: new Set(),
            })
          }

          const itemData = itemMap.get(key)!
          itemData.totalQuantity += item.quantity
          itemData.totalWeight += (item.weight || 0) * item.quantity
          itemData.orders.add(order.id)
          itemData.orderCount = itemData.orders.size

          // Track variants
          const variantKey = item.variant
          if (!itemData.variants.has(variantKey)) {
            itemData.variants.set(variantKey, 0)
          }
          itemData.variants.set(variantKey, itemData.variants.get(variantKey)! + item.quantity)
        })
      })

      // Convert to array and add priority and prep time
      return Array.from(itemMap.values()).map((item) => ({
        name: item.name,
        totalQuantity: item.totalQuantity,
        totalWeight: item.totalWeight,
        orderCount: item.orderCount,
        variants: Array.from(item.variants.entries()).map(([variant, quantity]) => ({
          variant,
          quantity,
        })),
        priority: calculatePriority(item.orderCount, item.totalWeight),
        estimatedPrepTime: calculatePrepTime(item.totalWeight),
      }))
    },
    [statusFilter],
  )

  const calculatePriority = (orderCount: number, totalWeight: number): "high" | "medium" | "low" => {
    if (orderCount >= 3 || totalWeight >= 2000) return "high"
    if (orderCount >= 2 || totalWeight >= 1000) return "medium"
    return "low"
  }

  const calculatePrepTime = (totalWeight: number): number => {
    const baseTime = Math.ceil(totalWeight / 100)
    return Math.max(baseTime, 5) // Minimum 5 minutes
  }

  // Load kitchen data
  const loadKitchenData = useCallback(
  async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)

      const response = await fetch("http://139.59.2.94:8000/api/admin/orders")
      const fetchedOrders: Order[] = await response.json()

      if (!response.ok || !Array.isArray(fetchedOrders)) {
        throw new Error("Failed to fetch orders")
      }

      setOrders(fetchedOrders)

      // Now calculate kitchen prep data from the real orders
      const prepData = calculateKitchenPrep(fetchedOrders)
      setKitchenData(prepData)

      if (!silent) {
        toast({
          title: "Success",
          description: "Kitchen data calculated successfully",
        })
      }
    } catch (error) {
      console.error("Error calculating kitchen data:", error)
      if (!silent) {
        toast({
          title: "Error",
          description: "Failed to calculate kitchen data",
          variant: "destructive",
        })
      }
    } finally {
      if (!silent) setIsLoading(false)
    }
  },
  [calculateKitchenPrep, toast]
)

  // Export kitchen data
  const exportKitchenData = () => {
    if (kitchenData.length === 0) {
      toast({
        title: "Error",
        description: "No kitchen data to export",
        variant: "destructive",
      })
      return
    }

    const headers = ["Product Name", "Total Weight (g)", "Order Count", "Variants", "Priority", "Prep Time (min)"]

    const rows = kitchenData.map((item) => [
      item.name,
      item.totalWeight,
      item.orderCount,
      item.variants.map((v) => `${v.variant}: ${v.quantity}x`).join("; "),
      item.priority,
      item.estimatedPrepTime,
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `kitchen_prep_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: `Exported ${kitchenData.length} preparation items`,
    })
  }

  // Calculate statistics
  const stats = {
    activeOrders: orders.filter((order) => statusFilter.split(",").includes(order.order_status)).length,
    totalWeight: kitchenData.reduce((sum, item) => sum + item.totalWeight, 0),
    uniqueItems: kitchenData.length,
  }

  // Effects
  useEffect(() => {
    loadKitchenData()
  }, [loadKitchenData])

  useEffect(() => {
    if (orders.length > 0) {
      const prepData = calculateKitchenPrep(orders)
      setKitchenData(prepData)
    }
  }, [statusFilter, orders, calculateKitchenPrep])

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    const variants = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }

    return <Badge className={`${variants[priority]} border-0 font-semibold uppercase text-xs`}>{priority}</Badge>
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-2">
                <Utensils className="h-7 w-7 text-purple-600" />
                Kitchen Preparation Calculator
              </h1>
              <p className="text-slate-600 text-sm">Calculate total quantities needed for order preparation</p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-xl shadow-md min-w-[130px]">
                <div className="flex items-center gap-3">
                  <Flame className="h-6 w-6 opacity-80" />
                  <div>
                    <div className="text-2xl font-bold">{stats.activeOrders.toLocaleString()}</div>
                    <div className="text-xs opacity-90">Active Orders</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-xl shadow-md min-w-[130px]">
                <div className="flex items-center gap-3">
                  <Weight className="h-6 w-6 opacity-80" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalWeight.toLocaleString()}g</div>
                    <div className="text-xs opacity-90">Total Weight</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-xl shadow-md min-w-[130px]">
                <div className="flex items-center gap-3">
                  <ListChecks className="h-6 w-6 opacity-80" />
                  <div>
                    <div className="text-2xl font-bold">{stats.uniqueItems.toLocaleString()}</div>
                    <div className="text-xs opacity-90">Unique Items</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Controls */}
        <div className="flex justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed,inprocess">Confirmed & In Process</SelectItem>
                <SelectItem value="confirmed">Confirmed Only</SelectItem>
                <SelectItem value="inprocess">In Process Only</SelectItem>
                <SelectItem value="all">All Active Orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => loadKitchenData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button variant="outline" onClick={exportKitchenData}>
              <Download className="h-4 w-4 mr-2" />
              Export Prep List
            </Button>
          </div>
        </div>

        {/* Kitchen Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-slate-600">Calculating preparation requirements...</p>
              </div>
            </div>
          ) : kitchenData.length === 0 ? (
            <div className="p-8">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍳</div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No preparation needed</h3>
                <p className="text-slate-500">No confirmed or in-process orders found.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Product Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Total Quantity (grams)</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Number of Orders</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Variants Breakdown</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Priority</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Estimated Prep Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {kitchenData
                    .sort((a, b) => {
                      const priorityOrder = { high: 3, medium: 2, low: 1 }
                      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                        return priorityOrder[b.priority] - priorityOrder[a.priority]
                      }
                      return b.totalWeight - a.totalWeight
                    })
                    .map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{item.totalWeight.toLocaleString()}g</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{item.orderCount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {item.variants.map((variant, vIndex) => (
                              <span
                                key={vIndex}
                                className="inline-block bg-slate-100 text-slate-700 px-2 py-1 rounded text-sm mr-1"
                              >
                                {variant.variant}: {variant.quantity}x
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">{getPriorityBadge(item.priority)}</td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">{item.estimatedPrepTime} min</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
