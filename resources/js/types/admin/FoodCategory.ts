export type FoodCategory = {
  id: number
  title: string
  slug: string
  image?: string
  description?: string
  status: boolean
  created_at: string
  updated_at: string
  deleted_at?: string
}