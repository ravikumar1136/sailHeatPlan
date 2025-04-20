import { Upload, FileSpreadsheet, Shield, BarChart4, Download, Zap } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <Upload className="h-6 w-6" />,
      title: "Easy Data Upload",
      description: "Upload your order and stock data with a simple drag-and-drop interface.",
    },
    {
      icon: <FileSpreadsheet className="h-6 w-6" />,
      title: "Automated Comparison",
      description: "Automatically compare grade and width between order and stock data.",
    },
    {
      icon: <BarChart4 className="h-6 w-6" />,
      title: "Heat Plan Generation",
      description: "Generate heat plans based on your data with precise calculations.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Authentication",
      description: "Your data is protected with secure user authentication and authorization.",
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Easy Export",
      description: "Download your generated heat plans in Excel format with a single click.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Fast Processing",
      description: "Process up to 6000 QTY per plan with optimized performance.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Features</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Our platform offers powerful tools to streamline your heat plan generation process.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-2 rounded-lg border p-6 bg-background shadow-sm transition-all hover:shadow-md"
            >
              <div className="rounded-full bg-primary/10 p-3 text-primary">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

