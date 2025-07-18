"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/types/products"

interface ProductModalProps {
  product: Product
  onClose: () => void
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Product Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-8">
            {/* Product Information */}
            <div> 
              <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Product Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Product ID:</strong>
                  <div className="text-purple-600 font-semibold">{product.id}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Name:</strong>
                  <div className="text-slate-900">{product.item_name}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Category:</strong>
                  <div className="text-slate-900">{product.category}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Shelf Life:</strong>
                  <div className="text-slate-900">{product.shelf_life_days} days</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <strong className="text-slate-700">Lead Time:</strong>
                  <div className="text-slate-900">{product.lead_time_days} days</div>
                </div>
              </div>
            </div>

            {/* Product Image */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Product Image
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg">
                <img
                  src={product.image_url || "/placeholder.svg?height=200&width=200"}
                  alt={product.item_name}
                  className="w-48 h-48 object-cover rounded-lg border border-slate-200"
                />
                <div className="mt-2 text-sm text-slate-600 font-mono break-all">
                  {product.image_url || "No image URL provided"}
                </div>
              </div>
            </div>

            {/* Pricing & Packaging */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Pricing & Packaging
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Package Size</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {product.packing_01 && (
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{product.packing_01}g</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">₹{product.price_01}</td>
                      </tr>
                    )}
                    {product.packing_02 && (
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{product.packing_02}g</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">₹{product.price_02}</td>
                      </tr>
                    )}
                    {product.packing_03 && (
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{product.packing_03}g</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">₹{product.price_03}</td>
                      </tr>
                    )}
                    {product.packing_04 && (
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-900">{product.packing_04}g</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">₹{product.price_04}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Description</h3>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700">{product.description || "No description available"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
