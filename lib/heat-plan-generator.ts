// This file contains the logic for generating heat plans

interface OrderData {
  grade: string
  width: number
  bQuantity: number
}

interface StockData {
  grade: string
  width: number
}

interface HeatPlanRow {
  grade: string
  width: number
  slabWt: string
  noOfHeats: number
  qty: number
}

// Function to check if an order matches any stock item
function hasMatchingStock(order: OrderData, stockData: StockData[]): boolean {
  return stockData.some((stock) => stock.grade === order.grade && stock.width === order.width)
}

// Function to calculate the number of heats based on quantity
function calculateHeats(quantity: number): number {
  // One heat is defined as 60 units
  return Math.ceil(quantity / 60)
}

// Main function to generate heat plan
export function generateHeatPlan(orderData: OrderData[], stockData: StockData[]): HeatPlanRow[] {
  // Filter out orders that match stock data
  const ordersToProcess = orderData.filter((order) => !hasMatchingStock(order, stockData))

  // Group orders by grade and width
  const groupedOrders: Record<string, OrderData[]> = {}

  ordersToProcess.forEach((order) => {
    const key = `${order.grade}-${order.width}`
    if (!groupedOrders[key]) {
      groupedOrders[key] = []
    }
    groupedOrders[key].push(order)
  })

  // Generate heat plan rows
  const heatPlanRows: HeatPlanRow[] = []

  Object.entries(groupedOrders).forEach(([key, orders]) => {
    // Calculate total quantity for this grade-width combination
    const totalQuantity = orders.reduce((sum, order) => sum + order.bQuantity, 0)

    // Extract grade and width from the key
    const [grade, widthStr] = key.split("-")
    const width = Number.parseInt(widthStr)

    // Calculate number of heats
    const noOfHeats = calculateHeats(totalQuantity)

    // Add to heat plan
    heatPlanRows.push({
      grade,
      width,
      slabWt: "", // Left empty as per requirements
      noOfHeats,
      qty: totalQuantity,
    })
  })

  return heatPlanRows
}

