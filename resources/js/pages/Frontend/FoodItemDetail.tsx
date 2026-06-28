import { Head, usePage } from '@inertiajs/react'
import { useState } from 'react'
import { ChevronLeft, Share2, Heart } from 'lucide-react'
import { formatMoney } from '@/lib/frontend/format-money'
import { useAppearance } from '@/hooks/use-appearance'
import { QuantityControls } from '@/components/Frontend/QuantityControls'
import Header from '@/components/Frontend/Header'
import type { FoodItem, SubCategory } from '@/types/frontend/Index'
import { Link } from '@inertiajs/react'

interface PageProps {
  fooditem: FoodItem
}

const FoodItemDetailPage = () => {
  const { fooditem } = usePage<PageProps>().props
  const { isDark, toggleTheme } = useAppearance()
  const [qty, setQty] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const imageUrl = fooditem.images?.[0] || null
  const emoji = fooditem.tags?.[0] || '🍽️'
  const isPopular = (fooditem.popularity_score ?? 0) >= 85

  const handleAddToCart = () => {
    try {
      const cartItem = { ...fooditem, qty }
      const cart = JSON.parse(localStorage.getItem('cart') || '{}')
      cart[fooditem.id] = cartItem
      localStorage.setItem('cart', JSON.stringify(cart))
      // signal welcome page to open cart and then navigate home
      localStorage.setItem('openCart', '1')
    } catch (e) {
      // ignore
    }
    // navigate back to welcome (will read localStorage and open cart)
    window.location.href = '/'
  }

  return (
    <>
      <Head title={fooditem.title} />
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-white dark:bg-[#0d1117]">
          {/* Header */}
          <Header isDark={isDark} toggleTheme={toggleTheme} totalItems={0} setCartOpen={setCartOpen} />

          {/* Main Content */}
          <main className="max-w-[1200px] mx-auto px-6 py-8">
            {/* Back Button */}
            <Link href="/">
              <button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Menu</span>
              </button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image Section */}
              <div className="flex items-center justify-center">
                <div className="w-full aspect-square rounded-[24px] bg-gradient-to-br from-black/[0.04] to-black/[0.01] dark:from-white/[0.04] dark:to-white/[0.01] border border-black/[0.06] dark:border-white/[0.07] flex items-center justify-center overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={fooditem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[120px] select-none">{emoji}</span>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="flex flex-col justify-between">
                {/* Header Info */}
                <div>
                  {/* Category Badge */}
                  {fooditem.subCategory && (
                    <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] bg-[#6bffb8]/10 text-[#00a37a] dark:text-[#6bffb8] border border-[#6bffb8]/20 mb-4">
                      {fooditem.subCategory.title}
                    </span>
                  )}

                  {/* Title */}
                  <h1
                    className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 leading-[1.2]"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    {fooditem.title}
                  </h1>

                  {/* Rating and Popularity */}
                  <div className="flex items-center gap-4 mb-6">
                    {isPopular && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        <span>🔥</span>
                        Popular Choice
                      </span>
                    )}
                    {fooditem.popularity_score && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Popularity: {fooditem.popularity_score}%
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {fooditem.description && (
                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-8">
                      {fooditem.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-8 pb-8 border-b border-black/[0.08] dark:border-white/[0.08]">
                    <p className="text-sm uppercase tracking-[0.1em] text-slate-500 dark:text-slate-600 mb-2">
                      Price per Item
                    </p>
                    <p
                      className="text-4xl font-bold text-[#00a37a] dark:text-[#6bffb8]"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {formatMoney(fooditem.price)}
                    </p>
                  </div>

                  {/* Tags */}
                  {fooditem.tags && fooditem.tags.length > 0 && (
                    <div className="mb-8">
                      <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-600 mb-3">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {fooditem.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="space-y-4 pt-8 border-t border-black/[0.08] dark:border-white/[0.08]">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm uppercase tracking-[0.1em] text-slate-500 dark:text-slate-600">
                      Quantity
                    </span>
                    <QuantityControls
                      qty={qty}
                      onAdd={() => setQty(q => q + 1)}
                      onRemove={() => setQty(q => Math.max(1, q - 1))}
                    />
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 rounded-[12px] bg-[#6bffb8]/10 text-[#00a37a] dark:text-[#6bffb8] border border-[#6bffb8]/22 hover:bg-[#6bffb8]/20 transition-colors font-semibold uppercase tracking-[0.1em] text-sm cursor-pointer"
                  >
                    + Add {qty} to Cart
                  </button>

                  {/* Secondary Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="flex-1 py-3 rounded-[12px] bg-black/[0.06] dark:bg-white/[0.07] hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isWishlisted
                            ? 'fill-red-500 text-red-500'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {isWishlisted ? 'Saved' : 'Save'}
                      </span>
                    </button>

                    <button className="flex-1 py-3 rounded-[12px] bg-black/[0.06] dark:bg-white/[0.07] hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="mt-16 pt-16 border-t border-black/[0.08] dark:border-white/[0.08]">
              <h2
                className="text-2xl font-bold text-slate-900 dark:text-white mb-8"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                About This Item
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07]">
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-600 mb-2">
                    Category
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {fooditem.subCategory?.title || 'Uncategorized'}
                  </p>
                </div>

                <div className="p-6 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07]">
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-600 mb-2">
                    Total Price (x{qty})
                  </p>
                  <p className="text-lg font-semibold text-[#00a37a] dark:text-[#6bffb8]">
                    {formatMoney(fooditem.price * qty)}
                  </p>
                </div>

                <div className="p-6 rounded-[16px] bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07]">
                  <p className="text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-600 mb-2">
                    Status
                  </p>
                  <p className={`text-lg font-semibold ${fooditem.status ? 'text-green-600' : 'text-red-600'}`}>
                    {fooditem.status ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default FoodItemDetailPage