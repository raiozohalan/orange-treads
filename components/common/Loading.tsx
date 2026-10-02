import Image from "next/image"
import logo from "@/assets/logo.webp"

const Loading = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <Image
        src={logo.src}
        alt="Orange Treads"
        width={160}
        height={160}
        className="relative animate-[ping_1s_cubic-bezier(0,0,0.5,1)_infinite]"
      />
      <Image
        src={logo.src}
        alt="Orange Treads"
        width={160}
        height={160}
        className="absolute top-1/2  left-1/2 transform -translate-1/2 rounded-full overflow-hidden animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]"
      />
    </div>
  )
}

export default Loading
