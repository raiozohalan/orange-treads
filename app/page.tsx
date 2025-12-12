import Image from "next/image"
import Link from "next/link"
import logo from "@/assets/logo.webp"
import facebookLogo from "@/assets/facebook/Facebook_Logo_Primary.webp"
// Initialize Firebase (this will be used by client components)
import "@/firebase/init"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-screen bg-black px-10 py-5">
      <div className="flex flex-col items-center justify-center gap-4">
        <Image src={logo.src} alt="Orange Treads" width={254} height={254} />
        <p className="text-orange-500 p-2 rounded-lg border-2 border-orange-500">
          Coming Soon
        </p>
      </div>
      <p className="text-4xl font-bold">Iloilo's Best Treads</p>
      <p className="text-lg text-gray-400">
        We offer a wide range of shoes for all your needs.
      </p>
      <p className="text-lg text-gray-400">
        We are a team of dedicated professionals who are passionate about
        providing the best possible service to our customers.
      </p>
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="text-lg font-bold text-gray-500">Follow us on:</p>
        <Link
          href="https://www.facebook.com/profile.php?id=61577470246423"
          className="flex items-center gap-2 text-xl text-blue-500 font-bold"
        >
          <Image src={facebookLogo.src} alt="Facebook" width={36} height={36} />
          Facebook
        </Link>
      </div>
    </div>
  )
}

export const dynamic = "force-dynamic";