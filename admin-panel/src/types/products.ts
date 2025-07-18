export interface Product {
  id: number
  item_name: string
  category?: string
  shelf_life_days?: number
  lead_time_days?: number
  packing_01?: string
  price_01?: number
  packing_02?: string
  price_02?: number
  packing_03?: string
  price_03?: number
  packing_04?: string
  price_04?: number
  description?: string
  image_url?: string
  is_enabled: boolean // ✅ Make sure this is included
}
