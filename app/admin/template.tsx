import "@/app/globals.css"
import AuthProvider from "@/providers/auth-provider"

function TemplateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthProvider>{children}</AuthProvider>
}

export default TemplateLayout
