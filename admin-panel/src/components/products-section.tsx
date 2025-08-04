"use client"

import { useState, useEffect, useCallback } from "react"
import { Package, Plus, Search, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProductsTable } from "./products-table"
import { ProductModal } from "./product-modal"
import { AddProductModal } from "./add-product-modal"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/products"

const CONFIG = {
  PRODUCTS_PER_PAGE: 20,
  SEARCH_DEBOUNCE_DELAY: 300,
  PRODUCTS_API_URL: "http://139.59.2.94:8000/api/products-state",
}

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("item_name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const { toast } = useToast()

  const loadProducts = useCallback(
    async (silent = false) => {
      try {
        console.log("Fetching products from:", CONFIG.PRODUCTS_API_URL)
        if (!silent) setIsLoading(true)

        const response = await fetch(CONFIG.PRODUCTS_API_URL)
        console.log("Products response status:", response.status)

        if (!response.ok) throw new Error("Failed to fetch products")

        const data: Product[] = await response.json()
        console.log("Products loaded:", data.length)

        const sortedData = data.sort((a, b) => a.item_name.localeCompare(b.item_name))
        setProducts(sortedData)
        setFilteredProducts(sortedData)

        if (!silent) {
          toast({
            title: "Success",
            description: "Products loaded successfully",
          })
        }
      } catch (error) {
        console.error("Error loading products:", error)
        if (!silent) {
          toast({
            title: "Error",
            description: "Failed to load products",
            variant: "destructive",
          })
        }
      } finally {
        if (!silent) setIsLoading(false)
      }
    },
    [toast]
  )

  const applyFiltersAndRender = useCallback(() => {
    let filtered = [...products]

    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.category === categoryFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.item_name.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query))
      )
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Product]
      let bValue: any = b[sortBy as keyof Product]

      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortOrder === "asc" ? -1 : 1
      if (bValue == null) return sortOrder === "asc" ? 1 : -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    setFilteredProducts(filtered)
  }, [products, categoryFilter, searchQuery, sortBy, sortOrder])

  const categories = [...new Set(products.map((p) => p.category))].sort()

  const stats = {
    totalProducts: products.length,
    totalCategories: categories.length,
lowStockProducts: products.filter((p) => (p.shelf_life_days ?? Infinity) < 30).length
  }

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    applyFiltersAndRender()
  }, [applyFiltersAndRender])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
    }, CONFIG.SEARCH_DEBOUNCE_DELAY)
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 mb-2">
                <Package className="h-7 w-7 text-purple-600" />
                Products Management
              </h1>
              <p className="text-slate-600 text-sm">
                Manage your product catalog, pricing, and inventory
              </p>
            </div>

            <div className="flex gap-4">
              <StatCard label="Total Products" value={stats.totalProducts} />
              <StatCard label="Categories" value={stats.totalCategories} />
              <StatCard label="Low Stock" value={stats.lowStockProducts} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Controls */}
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search products..."
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories
  .filter((category): category is string => !!category) // filter out undefined/null
  .map((category) => (
    <SelectItem key={category} value={category}>
      {category}
    </SelectItem>
))}

              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split("-")
                setSortBy(newSortBy)
                setSortOrder(newSortOrder as "asc" | "desc")
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="item_name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="item_name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                <SelectItem value="price_01-asc">Price (Low-High)</SelectItem>
                <SelectItem value="price_01-desc">Price (High-Low)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => loadProducts()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <ProductsTable
          products={filteredProducts}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onProductSelect={setSelectedProduct}
          isLoading={isLoading}
        />

        {/* Product Modal */}
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <AddProductModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              loadProducts()
            }}
          />
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-xl shadow-md min-w-[130px]">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 opacity-80" />
        <div>
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <div className="text-xs opacity-90">{label}</div>
        </div>
      </div>
    </div>
  )
}
