// This file contains the logic for processing uploaded files

interface OrderItem {
  grade: string
  width: number
  bQuantity: number
}

interface StockItem {
  grade: string
  width: number
}

interface HeatPlanItem {
  grade: string
  width: number
  slabWt: string
  noOfHeats: number
  qty: number
}

/**
 * Processes the order and stock data to generate a heat plan
 * @param orderData Array of order items
 * @param stockData Array of stock items
 * @returns Generated heat plan
 */
export function processFiles(orderData: any[], stockData: any[]): HeatPlanItem[] {
  // Extract relevant data from order items
  const orderItems: OrderItem[] = orderData
    .map((item) => ({
      grade: item.Grade || "",
      width: Number.parseInt(item.Wid || "0"),
      bQuantity: Number.parseFloat(item["B Qty"] || "0"),
    }))
    .filter((item) => item.grade && item.width && item.bQuantity)

  // Extract relevant data from stock items
  const stockItems: StockItem[] = stockData
    .map((item) => ({
      grade: item.GRD || "",
      width: Number.parseInt(item.WIDT || "0"),
    }))
    .filter((item) => item.grade && item.width)

  // Filter out orders that match stock data
  const filteredOrders = orderItems.filter(
    (order) => !stockItems.some((stock) => stock.grade === order.grade && stock.width === order.width),
  )

  // Group by grade and width
  const groupedOrders: Record<string, any> = {}

  filteredOrders.forEach((order) => {
    const key = `${order.grade}-${order.width}`
    if (!groupedOrders[key]) {
      groupedOrders[key] = {
        grade: order.grade,
        width: order.width,
        qty: 0,
      }
    }
    groupedOrders[key].qty += order.bQuantity
  })

  // Convert to array and calculate heats
  const heatPlan: HeatPlanItem[] = Object.values(groupedOrders).map((item) => ({
    grade: item.grade,
    width: item.width,
    slabWt: "",
    noOfHeats: Math.ceil(item.qty / 60),
    qty: item.qty,
  }))

  return heatPlan
}

/**
 * Parses CSV data into an array of objects
 * @param csvText CSV text content
 * @returns Array of objects with headers as keys
 */
export function parseCSV(csvText: string): any[] {
  const lines = csvText.split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = lines[i].split(",")
    const row: any = {}

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || ""
    })

    data.push(row)
  }

  return data
}

/**
 * Reads a file and returns its contents as text
 * @param file File to read
 * @returns Promise resolving to file contents
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}

