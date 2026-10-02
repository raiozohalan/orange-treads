"use client"

import classNames from "@/utils/classNames"
import Button from "./Button"
import Link from "next/dist/client/link"
import { usePathname } from "next/dist/client/components/navigation"
import { Edit, LogOut } from "react-feather"
import logo from "@/assets/logo.webp"
import { getClientAuth } from "@/firebase/init"

const SIDEBAR_LINKS: {
  name: string
  path: string
}[] = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    name: "Spin Wheel",
    path: "/admin/spin-wheel",
  },
]

const auth = getClientAuth()

const Sidebar = () => {
  const pathname = usePathname()

  const handleLogout = () => {
    // Implement your logout logic here
    auth?.signOut()
  }

  return (
    <nav
      className={classNames(
        "sticky left-0 top-0 flex-none flex flex-col justify-between items-stretch",
        "w-[248px] h-screen px-4 py-6"
      )}
    >
      <div className="flex-none w-full flex gap-1 items-center justify-start pb-4 border-b border-gray-800" >
        <img src={logo.src} alt="Orange Treads Logo" className="w-12 h-12" />
        <h2 className="font-bold">Orange Treads</h2>
      </div>
      <div className="flex-1 flex flex-col gap-1 pt-3">
        {SIDEBAR_LINKS.map((link) => (
          <Link
            href={link?.path}
            key={link?.path}
            className={classNames(
              "w-full px-4 py-2 rounded-md text-white",
              pathname === link?.path ? "bg-blue-700/30" : "bg-transparent",
              "hover:bg-blue-700/50 hover:text-white"
            )}
          >
            {link?.name}
          </Link>
        ))}
      </div>
      <Button
        className="flex-none flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-500 hover:text-white"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4" /> Logout
      </Button>
    </nav>
  )
}

export default Sidebar
