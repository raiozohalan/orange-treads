import "@/app/globals.css"
import Sidebar from "@/components/common/Sidebar"
import AuthProvider from "@/providers/auth-provider"

function TemplateLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-row">
          <div className="flex-none">
            <Sidebar />
          </div>
          <div className="flex-1 bg-[#121213]">{children}</div>
        </div>
      </div>
    </AuthProvider>
  )
}

export default TemplateLayout
