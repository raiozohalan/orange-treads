'use client'

import React from 'react'
import FirebaseUI from '@/components/firebase/FirebaseUI'

const page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <FirebaseUI 
          signInSuccessUrl="/admin"
          signInOptions={[
            {
              provider: "google.com",
            },
            // TODO: Add Facebook and email sign in options
            // {
            //   provider: "facebook.com",
            // },
            // {
            //   provider: "email",
            // },
          ]}
        />
      </div>
    </div>
  )
}

export default page