export type Filters = {
  order_status?: string[]
  product_category_name?: string[]
  customer_state?: string[]
}

export type KpiResult = {
  gmv: number
  revenue: number
  orders: number
  aov: number
  ipo: number
  items?: number
  cancel_rate: number
  on_time_rate: number
}

export type TimeSeriesPoint = {
  date: string
  revenue: number
  orders: number
}

export type TopProduct = {
  product_id: string
  product_category_name?: string | null
  gmv: number
  revenue: number
  orders: number
}
