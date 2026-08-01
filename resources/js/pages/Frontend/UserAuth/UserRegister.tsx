import React, { useState } from 'react'
import { ArrowRight, ChefHat, Mail, PhoneCall, UserCircle2, Lock, Eye, EyeOff, Check } from 'lucide-react'
import { Form, Link, useForm } from '@inertiajs/react'
import { loginPage, register, registerUser } from '@/routes'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InputError from '@/components/input-error'

const UserRegister = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#181c30] font-sans antialiased selection:bg-[#f07030] selection:text-white">

            <div className="relative hidden lg:flex lg:col-span-6 flex-col justify-between p-12 overflow-hidden bg-[#202440]">

                {/* Background Image with Dark Gradient Layer */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 scale-105 transition-transform duration-1000 hover:scale-100"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181c30] via-[#181c30]/50 to-transparent" />


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
                        Join the Club
                    </div>
                    <h2 className="font-serif text-3xl font-normal text-white leading-tight">
                        Create an account to unlock exclusive dining perks and faster checkout.
                    </h2>
                    <p className="text-sm text-[#a8a29e]">
                        Join thousands of food lovers enjoying artisanal dishes, instant reservations, and delivery rewards.
                    </p>
                </div>

                {/* Footer Badges */}
                <div className="relative z-10 flex items-center gap-6 text-xs text-[#a8a29e] tracking-wider">
                    <span>• Pickup</span>
                    <span>• Delivery</span>
                    <span>• Rewards</span>
                </div>
            </div>
            <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-[#1a2037] relative">
                <div className="w-full max-w-sm space-y-6 relative z-10">

                    <div className="space-y-2">
                        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                            Create an account
                        </h1>

                    </div>

                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-[#2e345b] w-full" />
                        <span className="bg-[#1a2037] px-3 text-xs text-[#78716c] absolute">
                            or sign up with email
                        </span>
                    </div>

                    {/* Form */}
                    <Form action={registerUser().url} method='post' className="space-y-3.5">
                        {({ errors,processing }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-300 font-semibold text-xs uppercase">
                                        Full Name
                                    </Label>
                                    <div className="relative">
                                        <UserCircle2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="John Doe"
                                            className="pl-10 bg-[#242a4a] border-[#2e345b] text-white placeholder:text-[#78716c] focus-visible:ring-primary h-11"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email Address Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-300 font-semibold text-xs uppercase">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            className="pl-10 bg-[#242a4a] border-[#2e345b] text-white placeholder:text-[#78716c] focus-visible:ring-primary h-11"

                                        />
                                    </div>
                                    <InputError message={errors.mail} />
                                </div>

                                {/* Phone Number Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-gray-300 font-semibold text-xs uppercase">
                                        Phone Number
                                    </Label>
                                    <div className="relative">
                                        <PhoneCall className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="9824578900"
                                            className="pl-10 bg-[#242a4a] border-[#2e345b] text-white placeholder:text-[#78716c] focus-visible:ring-primary h-11"

                                        />
                                    </div>
                                    <InputError message={errors.phone}/>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-300 font-semibold text-xs uppercase">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 bg-[#242a4a] border-[#2e345b] text-white placeholder:text-[#78716c] focus-visible:ring-primary h-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password}/>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-gray-300 font-semibold text-xs uppercase">
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716c]" />
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10 bg-[#242a4a] border-[#2e345b] text-white placeholder:text-[#78716c] focus-visible:ring-primary h-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>



                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.99] transition-all duration-150 !mt-5 disabled:opacity-50"
                                >
                                    <span>{processing ? 'Creating Account...' : 'Create Account'}</span>
                                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </button>
                            </>

                        )}


                    </Form>

                    {/* Existing Account Callout */}
                    <p className="text-center text-xs text-[#a8a29e]">
                        Already have an account?{' '}
                        <Link href={loginPage().url} className="font-semibold text-[#f07030] hover:underline">
                            Sign in
                        </Link>
                    </p>

                    {/* Footer */}
                    <div className="pt-2 border-t border-[#2e345b]/60 text-center">
                        <p className="text-xs text-[#78716c]">
                            © {new Date().getFullYear()} LTU Food. All rights reserved.
                        </p>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default UserRegister