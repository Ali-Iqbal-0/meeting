import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
const navbar = () => {
  return (
    <nav className='flex-between fixes z-50 w-full bg-gray-800 px-6 py-4 lg:px-10'>
      <Link href='/' className='flex items-centergap-1'>
      <Image
      src='/icons/logo.svg'
      width={38}
      height={32}
      alt='logo'
      className='max-sm:size-10'
      />
      <p className='text-[26px] font-extrabold text-white max-sm:hidden'>FAIR FORSE MEETING</p>
      </Link>

    </nav>
  )
}

export default navbar