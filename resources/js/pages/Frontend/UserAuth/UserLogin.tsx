import React, { useState } from 'react'
import { ArrowRight, Lock, Mail, Eye, EyeOff, Check, ChefHat } from 'lucide-react'
import { Form, Link } from '@inertiajs/react'
import { registerPage, userLogin } from '@/routes'
import { Button } from '@/components/ui/button'

const UserLogin = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#181c30] font-sans antialiased selection:bg-[#f07030] selection:text-white">

      {/* ── Left Hero Panel (Visual & Brand Experience) ── */}
      <div className="relative hidden lg:flex lg:col-span-6 flex-col justify-between p-12 overflow-hidden bg-[#202440]">

        {/* Background Image with Dark Gradient Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 scale-105 transition-transform duration-1000 hover:scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181c30] via-[#181c30]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#181c30]" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-white">
            LTU Food
          </span>
        </div>

        {/* Customer Value Proposition */}
        <div className="relative z-10 max-w-md space-y-4 mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-white tracking-widest uppercase">
            Member Experience
          </div>
          <h2 className="font-serif text-3xl font-normal text-white leading-tight">
            Order local favorites, earn rewards, and enjoy fast delivery.
          </h2>
          <p className="text-sm text-[#a8a29e]">
            Join us for unforgettable moments and artisanal dining crafted with passion.
          </p>
        </div>

        {/* Footer Badges */}
        <div className="relative z-10 flex items-center gap-6 text-xs text-[#a8a29e] tracking-wider">
          <span>• Pickup</span>
          <span>• Delivery</span>
          <span>• Rewards</span>
        </div>
      </div>

      {/* ── Right Login Form Panel ── */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-[#1a2037] relative">

        <div className="w-full max-w-sm space-y-8 relative z-10">

          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-[#a8a29e]">
              Sign in to manage your bookings and dining rewards.
            </p>
          </div>

          {/* Social Sign-in Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#242a4a] border border-[#2e345b] text-xs font-medium text-white hover:bg-[#2c325a] transition duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              Google
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#242a4a] border border-[#2e345b] text-xs font-medium text-white hover:bg-[#2c325a] transition duration-200"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.1-.97.04-2.16.65-2.85 1.46-.61.71-1.14 1.87-.99 2.99 1.09.08 2.2-.53 2.85-1.35z" />
              </svg>
              Apple
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#2e345b] w-full" />
            <span className="bg-[#1a2037] px-3 text-xs text-[#78716c] absolute">or continue with email</span>
          </div>

          {/* Form */}
          <Form
            action={userLogin().url}
            method="post"
            className="space-y-4"
          >
            {({errors, processing }) => (
              <>
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#d6d3d1]"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716c]">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                  
                      placeholder="your.email@example.com"
                      className="w-full rounded-xl bg-[#242a4a] border border-[#2e345b] pl-10 pr-4 py-3 text-sm text-white placeholder-[#78716c] transition duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold tracking-wider uppercase text-[#d6d3d1]"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#78716c]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      id="password"
                
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-[#242a4a] border border-[#2e345b] pl-10 pr-10 py-3 text-sm text-white placeholder-[#78716c] transition duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#78716c] hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1">{errors.password}</p>
                  )}
                </div>

               

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.99] transition-all duration-150 mt-2 disabled:opacity-50"
                >
                  <span>{processing ? 'Signing In...' : 'Sign In'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </>
            )}
          </Form>

          <p className="text-center text-xs text-[#a8a29e]">
            Don't have an account?{' '}
            <Link href={registerPage().url} className="font-semibold text-[#f07030] hover:underline">
              Create an account
            </Link>
          </p>

          {/* Footer */}
          <div className="pt-4 border-t border-[#2e345b]/60 text-center">
            <p className="text-xs text-[#78716c]">
              © {new Date().getFullYear()} LTU Food. All rights reserved.
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}

export default UserLogin