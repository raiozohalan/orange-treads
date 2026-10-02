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
        <div className="flex-1 flex flex-row min-h-screen">
          <div className="flex-none">
            <Sidebar />
          </div>
          <div className="flex-1 bg-[#121213] h-screen max-h-screen overflow-hidden">{children}</div>
        </div>
    </AuthProvider>
  )
}

export default TemplateLayout
