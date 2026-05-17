import { ArrowRight } from 'lucide-react'
import React, { useState } from 'react'

// NOTE: Replace <form> with Inertia's Form wrapper or useForm hook for Inertia routing.

const UserRegister = () => {
    const [agreed, setAgreed] = useState(false)

    return (
        <div className="min-h-screen grid grid-cols-2 max-md:grid-cols-1 overflow-hidden bg-[#0d0a08] font-sans">

            {/* ── Left decorative panel ── */}
            <div className="relative flex flex-col justify-center px-14 py-16 bg-white overflow-hidden max-md:hidden">
                <img
                    src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/authentication/illustration.svg"
                    alt="Illustration"
                    className="w-full h-auto max-h-[600px] object-contain"
                />

            </div>

            {/* ── Right register panel ── */}
            <div className="relative flex items-center justify-center px-16 py-15 bg-[#faf7f4] max-md:px-7 max-md:py-10">

                {/* Left separator line */}
                <div
                    className="absolute top-16 bottom-16 left-0 w-px max-md:hidden"
                    style={{
                        background: 'linear-gradient(to bottom, transparent, #e0d5ca 25%, #e0d5ca 75%, transparent)',
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
                    <div className="mb-8">
                        <h1 className="font-serif text-[32px] font-bold text-[#1a0f08] leading-[1.15] mb-2.5">
                            Create an account
                        </h1>
                        <p className="text-sm font-light text-[#9a8880]">
                            Join us today for exclusive management tools
                        </p>
                    </div>

                    <form action="/register" method="post">

                        {/* Full Name field */}
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-[11px] font-medium tracking-[0.1em] uppercase text-[#7a6860] mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="John Doe"
                                    className="w-full bg-white border border-[#e4d9d0] rounded-[10px] px-4 py-3.5 text-sm text-[#1a0f08] outline-none transition-all duration-200 shadow-sm placeholder:text-[#c0b0a6] focus:border-[#f07030] focus:ring-2 focus:ring-[#f07030]/10"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0b0a6] text-sm pointer-events-none">
                                    👤
                                </span>
                            </div>
                        </div>

                        {/* Mobile Number field */}
                        <div className="mb-4">
                            <label htmlFor="mobile" className="block text-[11px] font-medium tracking-[0.1em] uppercase text-[#7a6860] mb-2">
                                Mobile Number
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    name="mobile"
                                    id="mobile"
                                    placeholder="+1 234 567 8900"
                                    className="w-full bg-white border border-[#e4d9d0] rounded-[10px] px-4 py-3.5 text-sm text-[#1a0f08] outline-none transition-all duration-200 shadow-sm placeholder:text-[#c0b0a6] focus:border-[#f07030] focus:ring-2 focus:ring-[#f07030]/10"
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c0b0a6] text-sm pointer-events-none">
                                    �
                                </span>
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-[11px] font-medium tracking-[0.1em] uppercase text-[#7a6860] mb-2">
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
                        <div className="mb-6">
                            <label htmlFor="password" className="block text-[11px] font-medium tracking-[0.1em] uppercase text-[#7a6860] mb-2">
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

                        {/* Terms and conditions + Login link */}
                        <div className="flex flex-col gap-4 mb-7">
                            <div
                                className="flex items-start gap-3 cursor-pointer group"
                                onClick={() => setAgreed(a => !a)}
                            >
                                <div
                                    className={`w-[18px] h-[18px] mt-0.5 rounded-[5px] border flex items-center justify-center flex-shrink-0 transition-all duration-150 ${agreed
                                        ? 'bg-[#f07030] border-[#f07030]'
                                        : 'bg-white border-[#d0c4ba] group-hover:border-[#f07030]'
                                        }`}
                                >
                                    {agreed && (
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-[13px] text-[#7a6860] select-none leading-relaxed">
                                    I agree to the <a href="#" className="font-medium text-[#f07030] hover:underline" onClick={(e) => e.stopPropagation()}>Terms of Service</a> and <a href="#" className="font-medium text-[#f07030] hover:underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>.
                                </span>
                                <input type="checkbox" name="terms" hidden readOnly checked={agreed} />
                            </div>

                            <div className="text-[13px] text-[#7a6860]">
                                Already have an account?{' '}
                                <a href="/login" className="font-medium text-[#f07030] no-underline hover:opacity-70 transition-opacity duration-150">
                                    Log in here.
                                </a>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-[#1a0f08] text-white rounded-[10px] text-sm font-medium tracking-wide cursor-pointer relative overflow-hidden transition-all duration-150 shadow-[0_4px_16px_rgba(26,15,8,0.25)] hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(26,15,8,0.32)] active:translate-y-0 group"
                        >
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br from-[rgba(240,112,48,0.22)] to-transparent" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Create Account
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

export default UserRegister
