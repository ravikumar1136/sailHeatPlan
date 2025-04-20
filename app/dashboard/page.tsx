"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FileUploader } from "@/components/file-uploader"
import { HeatPlanResults } from "@/components/heat-plan-results"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Check, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface HeatPlanItem {
  grade: string
  width: number
  slab_wt: string
  no_of_heats: number
  qty: number
}

interface StockAvailabilityItem {
  grade: string
  width: number
  pkt: string
}

// Update the DashboardPage component
export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [orderFile, setOrderFile] = useState<File | null>(null)
  const [stockFile, setStockFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [heatPlanData, setHeatPlanData] = useState<HeatPlanItem[] | null>(null)
  const [stockAvailabilityData, setStockAvailabilityData] = useState<StockAvailabilityItem[] | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = localStorage.getItem("isAuthenticated")
    if (authStatus !== "true") {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  const handleOrderFileChange = (file: File | null) => {
    setOrderFile(file)
    setHeatPlanData(null)
    setStockAvailabilityData(null)
    setError("")
    setSuccess("")
  }

  const handleStockFileChange = (file: File | null) => {
    setStockFile(file)
    setHeatPlanData(null)
    setStockAvailabilityData(null)
    setError("")
    setSuccess("")
  }

  const generateHeatPlan = async () => {
    if (!orderFile || !stockFile) {
      setError("Please upload both order and stock data files.")
      return
    }

    setIsGenerating(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append('orderFile', orderFile)
      formData.append('stockFile', stockFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/generate-heat-plan`, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate heat plan')
      }

      const { heat_plan, stock_availability } = result.data

      if (!heat_plan.length && !stock_availability.length) {
        throw new Error('No data generated. Please check your input files.')
      }

      setHeatPlanData(heat_plan)
      setStockAvailabilityData(stock_availability)
      setSuccess('Data processed successfully!')

      // Switch to results tab
      setActiveTab('results')

      // Scroll to the tabs if needed
      if (tabsRef.current) {
        tabsRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process data. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!heatPlanData) return
    
    setIsDownloading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/api/download-heat-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: heatPlanData }),
      })

      if (!response.ok) {
        throw new Error('Failed to download heat plan')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `heat_plan_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setIsDownloaded(true)
      setTimeout(() => setIsDownloaded(false), 3000)
    } catch (error) {
      console.error('Download failed:', error)
      setError('Failed to download heat plan')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Heat Plan Generator</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" ref={tabsRef}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="results" disabled={!heatPlanData && !stockAvailabilityData}>
              Heat Plan
            </TabsTrigger>
            <TabsTrigger value="stock" disabled={!stockAvailabilityData}>
              Stock Availability
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Data</CardTitle>
                  <CardDescription>Upload your order data file (Excel or CSV format)</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    onFileChange={handleOrderFileChange}
                    acceptedFileTypes=".xlsx,.xls,.csv"
                    currentFile={orderFile}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stock Data</CardTitle>
                  <CardDescription>Upload your stock data file (Excel or CSV format)</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader
                    onFileChange={handleStockFileChange}
                    acceptedFileTypes=".xlsx,.xls,.csv"
                    currentFile={stockFile}
                  />
                </CardContent>
              </Card>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-6 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={generateHeatPlan}
                disabled={!orderFile || !stockFile || isGenerating}
                className="relative"
              >
                {isGenerating ? (
                  <>
                    <span className="opacity-0">Generate Heat Plan</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full border-2 border-background border-t-transparent animate-spin"></div>
                    </span>
                  </>
                ) : (
                  "Generate Heat Plan"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {heatPlanData && heatPlanData.length > 0 ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Heat Plan Results</CardTitle>
                  <Button onClick={handleDownload} disabled={isDownloading || isDownloaded}>
                    {isDownloading ? (
                      <>
                        <span className="opacity-0">Download</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <div className="h-5 w-5 rounded-full border-2 border-background border-t-transparent animate-spin"></div>
                        </span>
                      </>
                    ) : isDownloaded ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Heat plan generated successfully! You can download it using the button above.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Grade</TableHead>
                          <TableHead>Width (mm)</TableHead>
                          <TableHead>Slab wt (t)</TableHead>
                          <TableHead>NO OF HEATS</TableHead>
                          <TableHead>QTY</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {heatPlanData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.grade}</TableCell>
                            <TableCell>{row.width}</TableCell>
                            <TableCell>{row.slab_wt}</TableCell>
                            <TableCell>{row.no_of_heats}</TableCell>
                            <TableCell>{row.qty}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Heat Plan Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      No heat plan needed. All orders can be fulfilled from stock.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stock">
            {stockAvailabilityData && stockAvailabilityData.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Available Order in Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-4 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      The following orders can be fulfilled from existing stock.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Grade</TableHead>
                          <TableHead>Width (mm)</TableHead>
                          <TableHead>PKT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockAvailabilityData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{row.grade}</TableCell>
                            <TableCell>{row.width}</TableCell>
                            <TableCell>{row.pkt}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Available Order in Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      No orders can be fulfilled from existing stock.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

