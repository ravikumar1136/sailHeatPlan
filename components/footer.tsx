import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sailLogo.jpg-yyQ5QhCba9JIf1kxajt7tyxOLYWo4M.jpeg"
              alt="SAIL Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-bold">SAIL Heat Plan</span>
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/about" className="hover:text-primary">
            About
          </Link>
          <Link href="/privacy" className="hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="https://sail.co.in" className="hover:text-primary" target="_blank">
            SAIL Official
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SAIL. All rights reserved.</p>
      </div>
    </footer>
  )
}

