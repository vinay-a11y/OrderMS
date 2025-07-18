"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface AddProductModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddProductModal({ onClose, onSuccess }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    imagesrc: "",
    shelf_life_days: "",
    lead_time_days: "",
    packing_01: "",
    price_01: "",
    packing_02: "",
    price_02: "",
    packing_03: "",
    price_03: "",
    packing_04: "",
    price_04: "",
    description: "",
  })

  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Build payload with correct types
    const payload = {
      ...formData,
      shelf_life_days: formData.shelf_life_days ? Number(formData.shelf_life_days) : null,
      lead_time_days: formData.lead_time_days ? Number(formData.lead_time_days) : null,
      price_01: formData.price_01 ? Number(formData.price_01) : null,
      price_02: formData.price_02 ? Number(formData.price_02) : null,
      price_03: formData.price_03 ? Number(formData.price_03) : null,
      price_04: formData.price_04 ? Number(formData.price_04) : null,
    }

    try {
      const res = await fetch("http://localhost:8000/api/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error("Backend error:", err)
        throw new Error("Failed to add product")
      }

      onSuccess()
    } catch (err) {
      alert("Error adding product. See console for details.")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Add Product</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Product Name *" name="item_name" required onChange={handleChange} />
            <Input placeholder="Category *" name="category" required onChange={handleChange} />
            <Input placeholder="Image URL" name="imagesrc" onChange={handleChange} />
            <Input placeholder="Shelf Life (days) *" name="shelf_life_days" required type="number" onChange={handleChange} />
            <Input placeholder="Lead Time (days) *" name="lead_time_days" required type="number" onChange={handleChange} />
          </div>

          <h3 className="text-md font-semibold mt-4">Pricing & Packaging</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Packing 1 (grams)" name="packing_01" onChange={handleChange} />
            <Input placeholder="Price 1 (₹)" name="price_01" type="number" step="0.01" onChange={handleChange} />
            <Input placeholder="Packing 2 (grams)" name="packing_02" onChange={handleChange} />
            <Input placeholder="Price 2 (₹)" name="price_02" type="number" step="0.01" onChange={handleChange} />
            <Input placeholder="Packing 3 (grams)" name="packing_03" onChange={handleChange} />
            <Input placeholder="Price 3 (₹)" name="price_03" type="number" step="0.01" onChange={handleChange} />
            <Input placeholder="Packing 4 (grams)" name="packing_04" onChange={handleChange} />
            <Input placeholder="Price 4 (₹)" name="price_04" type="number" step="0.01" onChange={handleChange} />
          </div>

          <Textarea placeholder="Description" name="description" rows={4} onChange={handleChange} />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
