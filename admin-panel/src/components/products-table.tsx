"use client"
import { Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/types/products"

interface ProductsTableProps {
  products: Product[]
  currentPage: number
  onPageChange: (page: number) => void
  onProductSelect: (product: Product) => void
  isLoading: boolean
}

const PRODUCTS_PER_PAGE = 20

const handleDelete = async (id: number) => {
  const confirmed = window.confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  try {
    const res = await fetch(`http://localhost:8000/api/products/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Delete failed");

    alert("Product deleted successfully!");
    window.location.reload();
  } catch (error) {
    alert("Failed to delete the product.");
    console.error("Delete error:", error);
  }
};

const handleToggleStatus = async (id: number, currentStatus: boolean) => {
  try {
    const res = await fetch(`http://localhost:8000/api/products/${id}/toggle`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Toggle failed");

    const data = await res.json();
    alert(`Product ${data.new_status ? "enabled" : "disabled"} successfully!`);
    window.location.reload(); // Optional: use state update instead
  } catch (error) {
    alert("Failed to toggle product status.");
    console.error("Toggle error:", error);
  }
};

export function ProductsTable({ products, currentPage, onPageChange, onProductSelect, isLoading }: ProductsTableProps) {
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const paginatedProducts = products.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No products found</h3>
          <p className="text-slate-500">Try adjusting your search criteria or add new products.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Image</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Product Name</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Category</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Pricing</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Shelf Life</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Lead Time</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Description</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <img
                      src={product.image_url || "/placeholder.svg?height=50&width=50"}
                      alt={product.item_name}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{product.item_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-purple-100 text-purple-800 border-0">{product.category}</Badge>
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
                    <span className="font-medium text-slate-900">{product.lead_time_days} days</span>
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
  className={product.is_enabled ? "bg-green-600 hover:bg-green-700" : "bg-gray-200 text-slate-700"}
  onClick={() => handleToggleStatus(product.id, product.is_enabled)}
>
  {product.is_enabled ? "Disable" : "Enable"}
</Button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => onProductSelect(product)}>
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
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
