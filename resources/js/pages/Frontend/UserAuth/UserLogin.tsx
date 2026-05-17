import { ArrowLeft, ArrowRight } from 'lucide-react'
import React, { useState } from 'react'

// NOTE: Replace <form> with Inertia's <Form action="/login" method="post"> for Inertia routing.

const RestaurantLogin = () => {
  const [remember, setRemember] = useState(false)

  return (
    <div className="min-h-screen grid grid-cols-2 max-md:grid-cols-1 overflow-hidden bg-[#0d0a08] font-sans">

      {/* ── Left decorative panel ── */}
      <div className="relative flex flex-col justify-end px-14 py-16 bg-white overflow-hidden max-md:hidden">
        <img src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/authentication/illustration.svg" alt="" className='w-full h-[600px] object-fit' />

      </div>

      {/* ── Right login panel ── */}
      <div className="relative flex items-center justify-center px-16 py-15 bg-[#faf7f4] max-md:px-7 max-md:py-10">

        {/* Left separator line */}
        <div
          className="absolute top-16 bottom-16 left-0 w-px max-md:hidden"
          style={{
            background:
              'linear-gradient(to bottom, transparent, #e0d5ca 25%, #e0d5ca 75%, transparent)',
          }}
        />

        {/* Decorative corner bracket */}
        <div
          className="absolute top-8 right-8 w-12 h-12 opacity-60"
          style={{
            borderTop: '1.5px solid #e0d0c4',
            borderRight: '1.5px solid #e0d0c4',
            borderRadius: '0 6px 0 0',
          }}
        />

        <div className="w-full max-w-[380px]">

          {/* Header */}
          <div className="mb-11">

            <h1 className="font-serif text-[32px] font-bold text-[#1a0f08] leading-[1.15] mb-2.5">
              Welcome back
            </h1>
            <p className="text-sm font-light text-[#9a8880]">
              Sign in to your management console
            </p>
          </div>

          {/* Form — swap to <Form action="/login" method="post"> for Inertia */}
          <form action="/login" method="post">

            {/* Email field */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-[11px] font-medium tracking-[0.1em] uppercase text-[#7a6860] mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="manager@restaurant.com"
                  className="w-full bg-white border border-[#e4d9d0] rounded-[10px] px-4 py-3.5 text-sm text-[#1a0f08] outline-none transition-all duration-200 shadow-sm placeholder:text-[#c0b0a6] focus:border-[#f07030] focus:ring-2 focus:ring-[#f07030]/10"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0b0a6] text-sm pointer-events-none">
                  ✉
                </span>
              </div>
            </div>

            {/* Password field */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-[11px] font-medium tracking-[0.1em] uppercase text-[#7a6860] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#e4d9d0] rounded-[10px] px-4 py-3.5 text-sm text-[#1a0f08] outline-none transition-all duration-200 shadow-sm placeholder:text-[#c0b0a6] focus:border-[#f07030] focus:ring-2 focus:ring-[#f07030]/10"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0b0a6] text-sm pointer-events-none">
                  🔒
                </span>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between mb-7">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setRemember(r => !r)}
              >
                <div
                  className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-all duration-150 ${remember
                    ? 'bg-[#f07030] border-[#f07030]'
                    : 'bg-white border-[#d0c4ba]'
                    }`}
                >
                  {remember && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="#fff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-[#7a6860] select-none">Keep me signed in</span>
                <input type="checkbox" name="remember" hidden readOnly checked={remember} />
              </div>

              <a
                href="/forgot-password"
                className="text-[13px] font-medium text-[#f07030] no-underline hover:opacity-70 transition-opacity duration-150"
              >
                Forgot-password?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#1a0f08] text-white rounded-[10px] text-sm font-medium tracking-wide cursor-pointer relative overflow-hidden transition-all duration-150 shadow-[0_4px_16px_rgba(26,15,8,0.25)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(26,15,8,0.32)] active:translate-y-0 group"
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-[rgba(240,112,48,0.22)] to-transparent" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Login
                <ArrowRight className='size-4' />
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-8">
            <div className="flex-1 h-px bg-[#e4d9d0]" />
            <span className="text-[12px] text-[#b0a098] whitespace-nowrap">
              Restaurant Name here © {new Date().getFullYear()}
            </span>
            <div className="flex-1 h-px bg-[#e4d9d0]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestaurantLogin