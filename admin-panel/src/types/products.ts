export interface Product {
  id: number
  item_name: string
  category: string
  image_url: string | null
  shelf_life_days: number
  lead_time_days: number
  description: string | null
  packing_01: number | null
  price_01: number | null
  packing_02: number | null
  price_02: number | null
  packing_03: number | null
  price_03: number | null
  packing_04: number | null
  price_04: number | null
}
