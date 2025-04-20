"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

interface HeatPlanData {
  grade: string
  width: number
  slabWt: string
  noOfHeats: number
  qty: number
}

interface HeatPlanResultsProps {
  data: HeatPlanData[]
}

export function HeatPlanResults({ data }: HeatPlanResultsProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // Create a CSV string from the data
      const headers = ["Grade", "Width (mm)", "Slab wt (t)", "NO OF HEATS", "QTY"]
      const csvRows = [
        headers.join(","),
        ...data.map((row) => [row.grade, row.width, row.slabWt, row.noOfHeats, row.qty].join(",")),
      ]
      const csvString = csvRows.join("\n")

      // Create a blob and download it
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `heat_plan_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsDownloaded(true)

      // Reset the downloaded state after 3 seconds
      setTimeout(() => {
        setIsDownloaded(false)
      }, 3000)
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Heat Plan Results</CardTitle>
        <Button onClick={handleDownload} disabled={isDownloading || isDownloaded} className="relative">
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
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.grade}</TableCell>
                  <TableCell>{row.width}</TableCell>
                  <TableCell>{row.slabWt}</TableCell>
                  <TableCell>{row.noOfHeats}</TableCell>
                  <TableCell>{row.qty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

