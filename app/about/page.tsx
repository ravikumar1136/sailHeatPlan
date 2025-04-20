import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">About SAIL</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p>
              Steel Authority of India Limited (SAIL) is one of the largest state-owned steel-making companies based in
              New Delhi, India. It is a public sector undertaking, owned and operated by the Government of India with an
              annual turnover of INR 1,03,473 Crore for fiscal year 2022-23.
            </p>

            <h2>Our Vision</h2>
            <p>
              To be a respected world-class corporation and the leader in Indian steel business in quality,
              productivity, profitability and customer satisfaction.
            </p>

            <h2>Our Mission</h2>
            <ul>
              <li>
                To provide quality steel products and services for our customers' satisfaction and to generate adequate
                returns on investment.
              </li>
              <li>To conduct business activities in an ethical and transparent manner.</li>
              <li>To develop a strong global presence through international competitiveness.</li>
              <li>
                To work towards a sustainable future by managing the economic, social and environmental impacts of our
                business.
              </li>
            </ul>

            <h2>Heat Plan Generator</h2>
            <p>
              The Heat Plan Generator is an innovative tool designed to streamline the production planning process at
              SAIL. By comparing order data with available stock, it automatically generates optimized heat plans that
              maximize efficiency and minimize waste.
            </p>

            <p>
              This tool is part of SAIL's ongoing digital transformation initiative, aimed at leveraging technology to
              enhance operational efficiency and customer satisfaction.
            </p>

            <h2>Key Features</h2>
            <ul>
              <li>Automated comparison of order and stock data</li>
              <li>Intelligent heat plan generation based on grade and width matching</li>
              <li>Capacity to handle up to 6000 QTY per plan</li>
              <li>Secure user authentication and data protection</li>
              <li>Easy export of generated heat plans</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

