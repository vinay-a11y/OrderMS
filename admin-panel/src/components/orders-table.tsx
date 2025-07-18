"use client"

import { useRef, useEffect } from "react"
import { Eye, Check, X, Cog, Truck, Package, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import type { Order, OrderStatus } from "@/types/orders"

interface OrdersTableProps {
  orders: Order[]
  currentPage: number
  onPageChange: (page: number) => void
  onOrderSelect: (order: Order) => void
  onStatusUpdate: (orderId: number, status: OrderStatus) => void
  selectedOrders: Set<number>
  onOrderSelectionChange: (selected: Set<number>) => void
  isLoading: boolean
}

const ORDERS_PER_PAGE = 20

export function OrdersTable({
  orders,
  currentPage,
  onPageChange,
  onOrderSelect,
  onStatusUpdate,
  selectedOrders,
  onOrderSelectionChange,
  isLoading,
}: OrdersTableProps) {
  const selectAllRef = useRef<HTMLButtonElement>(null)

  // Pagination
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE)
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE
  const endIndex = startIndex + ORDERS_PER_PAGE
  const paginatedOrders = orders.slice(startIndex, endIndex)

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedOrders)
      paginatedOrders.forEach((order) => newSelected.add(order.id))
      onOrderSelectionChange(newSelected)
    } else {
      const newSelected = new Set(selectedOrders)
      paginatedOrders.forEach((order) => newSelected.delete(order.id))
      onOrderSelectionChange(newSelected)
    }
  }

  // Handle individual selection
  const handleOrderSelection = (orderId: number, checked: boolean) => {
    const newSelected = new Set(selectedOrders)
    if (checked) {
      newSelected.add(orderId)
    } else {
      newSelected.delete(orderId)
    }
    onOrderSelectionChange(newSelected)
  }

  // Calculate checkbox states
  const allCurrentPageSelected =
    paginatedOrders.length > 0 && paginatedOrders.every((order) => selectedOrders.has(order.id))
  const someCurrentPageSelected = paginatedOrders.some((order) => selectedOrders.has(order.id))

  // Update indeterminate state
  useEffect(() => {
    if (selectAllRef.current) {
      const checkbox = selectAllRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement
      if (checkbox) {
        checkbox.indeterminate = someCurrentPageSelected && !allCurrentPageSelected
      }
    }
  }, [someCurrentPageSelected, allCurrentPageSelected])

  // Status badge styling
  const getStatusBadge = (status: OrderStatus) => {
    const variants = {
      placed: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      inprocess: "bg-blue-100 text-blue-800",
      dispatched: "bg-orange-100 text-orange-800",
      delivered: "bg-purple-100 text-purple-800",
      completed: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    }

    return <Badge className={`${variants[status]} border-0 font-semibold uppercase text-xs`}>{status}</Badge>
  }

  // Action buttons based on order status
  const getActionButtons = (order: Order) => {
    const buttons = []

    switch (order.order_status) {
      case "placed":
        buttons.push(
          <Button
            key="confirm"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => onStatusUpdate(order.id, "confirmed")}
          >
            <Check className="h-3 w-3 mr-1" />
            Confirm
          </Button>,
          <Button key="reject" size="sm" variant="destructive" onClick={() => onStatusUpdate(order.id, "rejected")}>
            <X className="h-3 w-3 mr-1" />
            Reject
          </Button>,
        )
        break
      case "confirmed":
        buttons.push(
          <Button
            key="process"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => onStatusUpdate(order.id, "inprocess")}
          >
            <Cog className="h-3 w-3 mr-1" />
            Start Process
          </Button>,
        )
        break
      case "inprocess":
        buttons.push(
          <Button
            key="dispatch"
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => onStatusUpdate(order.id, "dispatched")}
          >
            <Truck className="h-3 w-3 mr-1" />
            Dispatch
          </Button>,
        )
        break
      case "dispatched":
        buttons.push(
          <Button
            key="deliver"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => onStatusUpdate(order.id, "delivered")}
          >
            <Package className="h-3 w-3 mr-1" />
            Mark Delivered
          </Button>,
        )
        break
      case "delivered":
        buttons.push(
          <Button
            key="complete"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onStatusUpdate(order.id, "completed")}
          >
            <Flag className="h-3 w-3 mr-1" />
            Complete
          </Button>,
        )
        break
      case "completed":
      case "rejected":
        buttons.push(
          <span key="no-action" className="text-slate-500 text-sm">
            No actions
          </span>,
        )
        break
    }

    buttons.push(
      <Button key="details" size="sm" variant="outline" onClick={() => onOrderSelect(order)}>
        <Eye className="h-3 w-3 mr-1" />
        Details
      </Button>,
    )

    return buttons
  }

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

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No orders found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or check a different tab.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full text-[14px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <Checkbox ref={selectAllRef} checked={allCurrentPageSelected} onCheckedChange={handleSelectAll} />
                </th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Order ID</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Customer & Phone</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Items [Item, Qty, Variant]</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Address</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={(checked) => handleOrderSelection(order.id, checked as boolean)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-purple-600">#{order.id}</div>
                      <div className="text-xs text-slate-500">{order.razorpay_order_id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900">{order.customer_name || "N/A"}</div>
                      <div className="text-xs text-slate-500">{order.phone_number || "N/A"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 text-sm">{formatDate(order.created_at)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-green-600">₹{order.total_amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(order.order_status)}</td>
                 <td className="px-6 py-4 align-top">
  <div className="flex flex-col gap-1 text-[13px] text-slate-700 max-w-[300px]">
    {order.items.slice(0, 3).map((item, index) => (
      <div
        key={index}
        className="bg-slate-100 rounded px-2 py-[2px] inline-block whitespace-nowrap w-fit text-[13px] text-slate-700"
      >
        {item.name} - {item.quantity} - {item.variant}
      </div>
    ))}
    {order.items.length > 3 && (
      <div className="text-xs text-slate-400">+{order.items.length - 3} more items</div>
    )}
  </div>
</td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 max-w-[200px] leading-tight">
                      {order.address.line1}
                      <br />
                      {order.address.city}, {order.address.state} - {order.address.pincode}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">{getActionButtons(order)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1}-{Math.min(endIndex, orders.length)} of {orders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className={currentPage === page ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
