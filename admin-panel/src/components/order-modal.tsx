"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/types/orders"

interface OrderModalProps {
  order: Order
  onClose: () => void
}

export function OrderModal({ order, onClose }: OrderModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      placed: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      inprocess: "bg-blue-100 text-blue-800",
      dispatched: "bg-orange-100 text-orange-800",
      delivered: "bg-purple-100 text-purple-800",
      completed: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border-0 font-semibold uppercase text-xs`}>
        {status}
      </Badge>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-8">
            {/* Order Information */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Order Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Order ID:</strong>
                  <div className="text-purple-600 font-semibold">#{order.id}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Razorpay ID:</strong>
                  <div className="text-slate-900 font-mono text-sm">{order.razorpay_order_id}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Customer:</strong>
                  <div className="text-slate-900">{order.customer_name || "N/A"}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Phone:</strong>
                  <div className="text-slate-900">{order.phone_number || "N/A"}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Status:</strong>
                  <div className="mt-1">{getStatusBadge(order.order_status)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Date:</strong>
                  <div className="text-slate-900">{formatDate(order.created_at)}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Total Amount:</strong>
                  <div className="text-green-600 font-semibold text-lg">₹{order.total_amount.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Delivery Address
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg border-l-4 border-purple-600">
                <p className="font-semibold text-slate-900">{order.address.line1}</p>
                <p className="text-slate-700">
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Item Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Variant</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Quantity</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Original Price</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {order.items.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-slate-600">{item.variant}</td>
                        <td className="px-4 py-3 text-slate-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">₹{item.price}</td>
                        <td className="px-4 py-3 text-slate-500 line-through">₹{item.originalPrice}</td>
                        <td className="px-4 py-3 text-slate-900 font-semibold">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
