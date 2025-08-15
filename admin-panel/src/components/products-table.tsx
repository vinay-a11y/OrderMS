"use client"
import { Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/products"
import { useState } from "react"

interface ProductsTableProps {
  products: Product[]
  currentPage: number
  onPageChange: (page: number) => void
  onProductSelect: (product: Product) => void
  onProductUpdate: () => void
  isLoading: boolean
}


const PRODUCTS_PER_PAGE = 20

export function ProductsTable({
  products,
  currentPage,
  onPageChange,
  onProductSelect,
  onProductUpdate,
  isLoading,
}: ProductsTableProps) {
  const { toast } = useToast()

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Delete failed")

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      })
      onProductUpdate() // Update the UI without full page reload
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the product.",
        variant: "destructive",
      })
      console.error("Delete error:", error)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${id}/toggle`, {
        method: "PATCH",
      })

      if (!res.ok) throw new Error("Toggle failed")

      const data = await res.json()
      toast({
        title: "Success",
        description: `Product ${data.new_status ? "enabled" : "disabled"} successfully!`,
      })
      onProductUpdate() // Update the UI without full page reload
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle product status.",
        variant: "destructive",
      })
      console.error("Toggle error:", error)
    }
  }

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const paginatedProducts = products.slice(startIndex, endIndex)
  const [editProduct, setEditProduct] = useState<Product | null>(null);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No products found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or add new products.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
  <table className="min-w-[1400px] w-full">

            <thead className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Image</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Product Name</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Category</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Pricing</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Shelf Life</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Description</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-emerald-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <img
                      src={product.image_url || "/placeholder.svg?height=50&width=50"}
                      alt={product.item_name}
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{product.item_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-0 shadow-sm">
                      {product.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {product.packing_01 && (
                        <div className="text-sm">
                          {product.packing_01}g: <strong className="text-green-600">₹{product.price_01}</strong>
                        </div>
                      )}
                      {product.packing_02 && (
                        <div className="text-sm">
                          {product.packing_02}g: <strong className="text-green-600">₹{product.price_02}</strong>
                        </div>
                      )}
                      {product.packing_03 && (
                        <div className="text-sm">
                          {product.packing_03}g: <strong className="text-green-600">₹{product.price_03}</strong>
                        </div>
                      )}
                      {product.packing_04 && (
                        <div className="text-sm">
                          {product.packing_04}g: <strong className="text-green-600">₹{product.price_04}</strong>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{product.shelf_life_days} days</span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 max-w-[200px] line-clamp-3">
                      {product.description || "No description available"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      size="sm"
                      variant={product.is_enabled ? "default" : "outline"}
                      className={
                        product.is_enabled
                          ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-sm"
                          : "bg-gradient-to-r from-gray-200 to-gray-300 text-slate-700 hover:from-gray-300 hover:to-gray-400"
                      }
                      onClick={() => handleToggleStatus(product.id, product.is_enabled)}
                    >
                      {product.is_enabled ? "Disable" : "Enable"}
                    </Button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onProductSelect(product)}
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
  size="sm"
  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm"
  onClick={() => {
    setEditProduct(product); // product from this row
    setIsEditModalOpen(true);
  }}
>
  <Edit className="h-3 w-3 mr-1" />
  Edit
</Button>

                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of {products.length} products
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
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
                      className={
                        currentPage === page
                          ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-sm"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }
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
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
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

