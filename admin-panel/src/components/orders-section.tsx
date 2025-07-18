"use client"

import { useState, useEffect, useCallback } from "react"
import { ClipboardList, ShoppingCart, Clock, HourglassIcon, Search, X, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrdersTable } from "./orders-table"
import { OrderModal } from "./order-modal"
import { useToast } from "@/hooks/use-toast"
import type { Order, OrderStatus, TabType } from "@/types/orders"

// Configuration
const CONFIG = {
  ORDERS_PER_PAGE: 20,
  RECENT_DAYS_FILTER: 10,
  SEARCH_DEBOUNCE_DELAY: 300,
  API_BASE_URL: "/api/admin/orders",
  AUTO_REFRESH_INTERVAL: 30000,
}

export function OrdersSection() {
  // State management
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [currentTab, setCurrentTab] = useState<TabType>("recent")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set())
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { toast } = useToast()

  // Load orders from API
  const loadOrders = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true)

        // Try to fetch from backend first
        try {
          const response = await fetch("http://localhost:8000/api/admin/orders", {
            credentials: "include",
          })

          if (response.ok) {
            const data = await response.json()
            setOrders(
              data.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
            )
            if (!silent) {
              toast({
                title: "Success",
                description: "Orders loaded from backend",
              })
            }
            return
          }
        } catch (error) {
          console.error("Backend fetch failed, using mock data:", error)
        }

        // Fallback to mock data
        const mockOrders: Order[] = [
          {
            id: 1001,
            razorpay_order_id: "order_demo_001",
            customer_name: "John Doe",
            phone_number: "+91 9876543210",
            created_at: new Date().toISOString(),
            total_amount: 1250,
            order_status: "placed",
            items: [
              { name: "Organic Almonds", variant: "500g", quantity: 2, price: 450, originalPrice: 500, weight: 500 },
              { name: "Honey", variant: "250g", quantity: 1, price: 350, originalPrice: 400, weight: 250 },
            ],
            address: {
              line1: "123 Main Street",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400001",
            },
          },
          {
            id: 1002,
            razorpay_order_id: "order_demo_002",
            customer_name: "Jane Smith",
            phone_number: "+91 9876543211",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            total_amount: 850,
            order_status: "confirmed",
            items: [
              { name: "Organic Rice", variant: "1kg", quantity: 1, price: 850, originalPrice: 900, weight: 1000 },
            ],
            address: {
              line1: "456 Park Avenue",
              city: "Delhi",
              state: "Delhi",
              pincode: "110001",
            },
          },
          {
            id: 1003,
            razorpay_order_id: "order_demo_003",
            customer_name: "Bob Johnson",
            phone_number: "+91 9876543212",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            total_amount: 2100,
            order_status: "inprocess",
            items: [{ name: "Mixed Nuts", variant: "500g", quantity: 3, price: 700, originalPrice: 750, weight: 500 }],
            address: {
              line1: "789 Oak Street",
              city: "Bangalore",
              state: "Karnataka",
              pincode: "560001",
            },
          },
          {
            id: 1004,
            razorpay_order_id: "order_demo_004",
            customer_name: "Alice Brown",
            phone_number: "+91 9876543213",
            created_at: new Date(Date.now() - 259200000).toISOString(),
            total_amount: 1800,
            order_status: "dispatched",
            items: [
              { name: "Cashews", variant: "250g", quantity: 2, price: 600, originalPrice: 650, weight: 250 },
              { name: "Dates", variant: "500g", quantity: 1, price: 600, originalPrice: 700, weight: 500 },
            ],
            address: {
              line1: "321 Pine Street",
              city: "Chennai",
              state: "Tamil Nadu",
              pincode: "600001",
            },
          },
          {
            id: 1005,
            razorpay_order_id: "order_demo_005",
            customer_name: "Charlie Wilson",
            phone_number: "+91 9876543214",
            created_at: new Date(Date.now() - 345600000).toISOString(),
            total_amount: 950,
            order_status: "delivered",
            items: [{ name: "Walnuts", variant: "300g", quantity: 1, price: 950, originalPrice: 1000, weight: 300 }],
            address: {
              line1: "654 Elm Street",
              city: "Pune",
              state: "Maharashtra",
              pincode: "411001",
            },
          },
        ]

        setOrders(mockOrders)
        if (!silent) {
          toast({
            title: "Mock Data Loaded",
            description: "Using demo data for testing",
          })
        }
      } catch (error) {
        console.error("Error loading orders:", error)
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
    [toast],
  )

  // Update order status
  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      // Try to update via API first
      try {
        const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ order_status: newStatus }),
        })

        if (response.ok) {
          const updatedOrder = await response.json()
          setOrders((prev) =>
            prev.map((order) =>
              order.id === orderId ? { ...order, order_status: updatedOrder.order_status || newStatus } : order,
            ),
          )
          toast({
            title: "Success",
            description: `Order #${orderId} status updated to ${newStatus}`,
          })
          return
        }
      } catch (error) {
        console.error("API update failed, updating locally:", error)
      }

      // Fallback to local update
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, order_status: newStatus } : order)))
      toast({
        title: "Success",
        description: `Order #${orderId} status updated to ${newStatus} (demo mode)`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  // Bulk update status
  const bulkUpdateStatus = async (newStatus: OrderStatus) => {
    if (selectedOrders.size === 0) {
      toast({
        title: "Error",
        description: "No orders selected",
        variant: "destructive",
      })
      return
    }

    try {
      const orderIds = Array.from(selectedOrders)

      // Update locally
      setOrders((prev) =>
        prev.map((order) => (orderIds.includes(order.id) ? { ...order, order_status: newStatus } : order)),
      )

      setSelectedOrders(new Set())

      toast({
        title: "Success",
        description: `${orderIds.length} orders updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error bulk updating orders:", error)
      toast({
        title: "Error",
        description: "Failed to update orders",
        variant: "destructive",
      })
    }
  }

  // Export to CSV
  const exportOrders = () => {
    if (filteredOrders.length === 0) {
      toast({
        title: "Error",
        description: "No orders to export",
        variant: "destructive",
      })
      return
    }

    const headers = [
      "Order ID",
      "Razorpay ID",
      "Customer Name",
      "Phone",
      "Date",
      "Amount",
      "Status",
      "Items",
      "Address",
    ]

    const rows = filteredOrders.map((order) => [
      order.id,
      order.razorpay_order_id,
      order.customer_name || "",
      order.phone_number || "",
      formatDate(order.created_at),
      order.total_amount,
      order.order_status,
      order.items.map((item) => `${item.name} (${item.quantity}x${item.variant})`).join("; "),
      `${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `orders_${currentTab}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: `Exported ${filteredOrders.length} orders`,
    })
  }

  // Apply filters and render
  const applyFiltersAndRender = useCallback(() => {
    let filtered = [...orders]

    // Apply tab filter
    const now = new Date()
    const recentCutoff = new Date(now)
    recentCutoff.setDate(recentCutoff.getDate() - CONFIG.RECENT_DAYS_FILTER)

    switch (currentTab) {
      case "recent":
        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.created_at)
          return orderDate >= recentCutoff
        })
        break
      case "placed":
        filtered = filtered.filter((order) => order.order_status === "placed")
        break
      case "confirmed":
        filtered = filtered.filter((order) => order.order_status === "confirmed")
        break
      case "inprocess":
        filtered = filtered.filter((order) => order.order_status === "inprocess")
        break
      case "dispatched":
        filtered = filtered.filter((order) => order.order_status === "dispatched")
        break
      case "delivered":
        filtered = filtered.filter((order) => order.order_status === "delivered")
        break
      case "completed":
        filtered = filtered.filter((order) => order.order_status === "completed")
        break
      case "rejected":
        filtered = filtered.filter((order) => order.order_status === "rejected")
        break
      case "all":
      default:
        // No filter
        break
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.created_at)
            orderDate.setHours(0, 0, 0, 0)
            return orderDate.getTime() === today.getTime()
          })
          break
        case "yesterday":
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.created_at)
            orderDate.setHours(0, 0, 0, 0)
            return orderDate.getTime() === yesterday.getTime()
          })
          break
        case "week":
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.created_at)
            return orderDate >= weekAgo
          })
          break
        case "month":
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.created_at)
            return orderDate >= monthAgo
          })
          break
        case "custom":
          if (startDate || endDate) {
            filtered = filtered.filter((order) => {
              const orderDate = new Date(order.created_at)
              if (startDate && orderDate < new Date(startDate)) return false
              if (endDate && orderDate > new Date(endDate + "T23:59:59")) return false
              return true
            })
          }
          break
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(query) ||
          order.razorpay_order_id.toLowerCase().includes(query) ||
          (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
          (order.phone_number && order.phone_number.toLowerCase().includes(query)),
      )
    }

    // Apply sorting with proper null/undefined handling
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Order]
      let bValue: any = b[sortBy as keyof Order]

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortOrder === "asc" ? -1 : 1
      if (bValue == null) return sortOrder === "asc" ? 1 : -1

      if (sortBy === "created_at") {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      } else if (sortBy === "total_amount") {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    setFilteredOrders(filtered)
  }, [orders, currentTab, searchQuery, sortBy, sortOrder, dateFilter, startDate, endDate])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate statistics
  const stats = {
    totalOrders: orders.length,
    recentOrders: orders.filter((order) => {
      const recentCutoff = new Date()
      recentCutoff.setDate(recentCutoff.getDate() - CONFIG.RECENT_DAYS_FILTER)
      return new Date(order.created_at) >= recentCutoff
    }).length,
    pendingOrders: orders.filter((order) => !["completed", "rejected"].includes(order.order_status)).length,
  }

  // Calculate tab counts
  const tabCounts = {
    recent: orders.filter((order) => {
      const recentCutoff = new Date()
      recentCutoff.setDate(recentCutoff.getDate() - CONFIG.RECENT_DAYS_FILTER)
      return new Date(order.created_at) >= recentCutoff
    }).length,
    placed: orders.filter((order) => order.order_status === "placed").length,
    confirmed: orders.filter((order) => order.order_status === "confirmed").length,
    inprocess: orders.filter((order) => order.order_status === "inprocess").length,
    dispatched: orders.filter((order) => order.order_status === "dispatched").length,
    delivered: orders.filter((order) => order.order_status === "delivered").length,
    completed: orders.filter((order) => order.order_status === "completed").length,
    rejected: orders.filter((order) => order.order_status === "rejected").length,
    all: orders.length,
  }

  // Effects
  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  useEffect(() => {
    applyFiltersAndRender()
  }, [applyFiltersAndRender])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
    }, CONFIG.SEARCH_DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Tab definitions
  const tabs = [
    { id: "recent" as TabType, label: "Recent Orders (10 days)", icon: Clock, count: tabCounts.recent },
    { id: "placed" as TabType, label: "Placed", icon: ShoppingCart, count: tabCounts.placed },
    { id: "confirmed" as TabType, label: "Confirmed", icon: ShoppingCart, count: tabCounts.confirmed },
    { id: "inprocess" as TabType, label: "In Process", icon: ShoppingCart, count: tabCounts.inprocess },
    { id: "dispatched" as TabType, label: "Dispatched", icon: ShoppingCart, count: tabCounts.dispatched },
    { id: "delivered" as TabType, label: "Delivered", icon: ShoppingCart, count: tabCounts.delivered },
    { id: "completed" as TabType, label: "Completed", icon: ShoppingCart, count: tabCounts.completed },
    { id: "rejected" as TabType, label: "Rejected", icon: ShoppingCart, count: tabCounts.rejected },
    { id: "all" as TabType, label: "All Orders", icon: ShoppingCart, count: tabCounts.all },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-2">
                <ClipboardList className="h-7 w-7 text-purple-600" />
                Orders Management
              </h1>
              <p className="text-slate-600 text-sm">
                Manage and track all customer orders with progression: Placed → Confirmed → In Process → Dispatched →
                Delivered
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-xl shadow-md min-w-[130px]">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6 opacity-80" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
                    <div className="text-xs opacity-90">Total Orders</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-xl shadow-md min-w-[130px]">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 opacity-80" />
                  <div>
                    <div className="text-2xl font-bold">{stats.recentOrders.toLocaleString()}</div>
                    <div className="text-xs opacity-90">Recent Orders</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-xl shadow-md min-w-[130px]">
                <div className="flex items-center gap-3">
                  <HourglassIcon className="h-6 w-6 opacity-80" />
                  <div>
                    <div className="text-2xl font-bold">{stats.pendingOrders.toLocaleString()}</div>
                    <div className="text-xs opacity-90">Pending Orders</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-10xl mx-auto p-8">
        {/* Navigation Tabs */}
        <nav className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id)
                  setCurrentPage(1)
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                  currentTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    currentTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Controls */}
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by Order ID, Razorpay ID, Customer Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === "custom" && (
              <>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
              </>
            )}

            {/* Action Buttons */}
            <Button variant="outline" onClick={() => loadOrders()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button variant="outline" onClick={exportOrders}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.size > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-purple-700">
                {selectedOrders.size} order{selectedOrders.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => bulkUpdateStatus("confirmed")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Confirm All
                </Button>
                <Button size="sm" onClick={() => bulkUpdateStatus("rejected")} variant="destructive">
                  Reject All
                </Button>
                <Button size="sm" onClick={() => setSelectedOrders(new Set())} variant="outline">
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <OrdersTable
          orders={filteredOrders}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onOrderSelect={setSelectedOrder}
          onStatusUpdate={updateOrderStatus}
          selectedOrders={selectedOrders}
          onOrderSelectionChange={setSelectedOrders}
          isLoading={isLoading}
        />

        {/* Order Details Modal */}
        {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      </div>
    </div>
  )
}
