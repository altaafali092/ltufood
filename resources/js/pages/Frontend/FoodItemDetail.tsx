import { Head, Link, router, usePage } from '@inertiajs/react'
import { ChevronLeft, Share2, Heart, Check, Loader2 } from 'lucide-react'
import { useState, useMemo } from 'react'

import type { CartState } from '@/components/Frontend/CartDrawer';
import CartDrawer from '@/components/Frontend/CartDrawer'
import FloatingCartBar from '@/components/Frontend/FloatingCartBar'
import Header from '@/components/Frontend/Header'
import { QuantityControls } from '@/components/Frontend/QuantityControls'
import { useAppearance } from '@/hooks/use-appearance'
import { cartStore, cartUpdate, ordersStore } from '@/routes'
import type { CartItem } from '@/types'
import type { FoodItem } from '@/types/frontend/Index'
import { Money } from '@/Utils/Money';



interface PageProps {
  fooditem: FoodItem
  cartItems: CartItem[]
  totalQuantity: number
  totalPrice: number
  activeTable?: { id: number; table_number: string } | null
  [key: string]: unknown
}



export default function FoodItemDetailPage() {
  const { fooditem, cartItems, totalQuantity, totalPrice, activeTable } = usePage<PageProps>().props
  const { resolvedAppearance, updateAppearance } = useAppearance()
  const isDark = resolvedAppearance === 'dark'
  const toggleTheme = () => updateAppearance(isDark ? 'light' : 'dark')

  // Local State
  const [qty, setQty] = useState<number>(1)
  
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false)
  const [cartOpen, setCartOpen] = useState<boolean>(false)
  const [ordered, setOrdered] = useState<boolean>(false)
  const [added, setAdded] = useState<boolean>(false)
  const [processing, setProcessing] = useState<boolean>(false)

  // Derived values
  const imageUrl = fooditem.images?.[0] || null
  const subCategory = fooditem.sub_category ?? fooditem.subCategory ?? null
  const emoji = fooditem.tags?.[0] || '🍽️'
  const isPopular = (fooditem.popularity_score ?? 0) >= 85
  const lineTotalPrice = useMemo(() => fooditem.price * qty, [fooditem.price, qty])


  const requestOptions = {
    preserveScroll: true,
    preserveState: true,
  }

  const cart = useMemo<CartState>(() => {
    const rawItems = Array.isArray(cartItems) ? cartItems : []

    return rawItems.reduce<CartState>((items, line) => {
      items[line.food_item_id] = {
        ...(line.food_item_id === fooditem.id
          ? fooditem
          : {
              id: line.food_item_id,
              title: line.slug ?? `Item #${line.food_item_id}`,
              slug: line.slug ?? String(line.food_item_id),
              description: null,
              price: line.price,
              popularity_score: 0,
              images: line.image ? [line.image] : null,
              status: true,
              tags: null,
              sub_category: null,
            }),
        qty: line.quantity ?? 1,
      }

      return items
    }, {})
  }, [cartItems, fooditem])

  const handleAddToCart = () => {
    setProcessing(true)
    setAdded(false)

    router.post(
      cartStore(fooditem.id).url,
      { quantity: qty },
      {
        ...requestOptions,
        onSuccess: () => {
          setAdded(true)
          setTimeout(() => setAdded(false), 1800)
        },
        onFinish: () => setProcessing(false),
      },
    )
  }

  const addToCart = (item: FoodItem) => {
    router.post(cartStore(item.id).url, { quantity: 1 }, requestOptions)
  }

  const removeFromCart = (id: number) => {
    const quantity = cart[id]?.qty ?? 0

    if (quantity > 1) {
      router.put(cartUpdate(id).url, { quantity: quantity - 1 }, requestOptions)

      return
    }

    router.delete(`/cart/${id}`, requestOptions)
  }

  const placeOrder = () => {
    if (Object.keys(cart).length === 0 || processing) {
      return
    }

    setProcessing(true)

    router.post(
      ordersStore().url,
      {
        table_id: activeTable?.id ?? null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setOrdered(true)
          setTimeout(() => {
            setOrdered(false)
            setCartOpen(false)
          }, 3200)
        },
        onFinish: () => setProcessing(false),
      },
    )
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fooditem.title,
          text: fooditem.description,
          url: window.location.href,
        })
      } catch {
        // Ignored fallback
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <>
      <Head title={`${fooditem.title} - LTU Food`} />

      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-[#f7f9f8] dark:bg-[#0d1117] font-sans text-slate-900 dark:text-slate-100 transition-colors">
          {/* Header */}
          <Header
            isDark={isDark}
            toggleTheme={toggleTheme}
            totalItems={totalQuantity ?? 0}
            setCartOpen={setCartOpen}
          />

          {/* Main Container */}
          <main className="max-w-[1040px] mx-auto px-4 sm:px-6 py-6 md:py-10">
            {/* Back Navigation */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold text-sm mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Menu</span>
            </Link>

            {/* Content Hero Card (Matches Menu Container Aesthetic) */}
            <div className="bg-[#f0f3f1] dark:bg-[#161b22] rounded-[28px] p-6 sm:p-8 md:p-10 shadow-sm border border-slate-200/50 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">

                {/* Left Column: Image Area with Badges */}
                <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-[20px] overflow-hidden bg-white dark:bg-[#0d1117] shadow-sm border border-black/5 dark:border-white/5">
                  {imageUrl ? (
                    <img
                      src={imageUrl ?? undefined}
                      alt={fooditem.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
                      <span className="text-8xl select-none">{emoji}</span>
                    </div>
                  )}

                  {/* Overlaid Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {subCategory && (
                      <span className="bg-[#e6f9f3] dark:bg-[#0b8a60]/20 text-[#0b8a60] dark:text-[#6bffb8] text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                        {subCategory.title}
                      </span>
                    )}
                    {isPopular && (
                      <span className="bg-[#ff4d4d] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                        🔥 Hot
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Column: Details & Customizations */}
                <div className="flex flex-col h-full justify-between">
                  <div>
                    {/* Title & Price Header */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h1
                        className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {fooditem.title}
                      </h1>
                      <span
                        className="text-2xl sm:text-3xl font-bold text-[#00a37a] dark:text-[#6bffb8] whitespace-nowrap"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {Money(fooditem.price)}
                      </span>
                    </div>

                    {/* Description */}
                    {fooditem.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                        {fooditem.description}
                      </p>
                    )}

                    <hr className="border-slate-300/60 dark:border-slate-700/60 mb-6" />

                
                    

                    {/* Quantity Control */}
                    <div className="mb-8">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                        Quantity
                      </label>
                      <div className="bg-white dark:bg-[#0d1117] rounded-full p-1 w-fit shadow-sm border border-black/5 dark:border-white/5">
                        <QuantityControls
                          qty={qty}
                          onAdd={() => setQty((q) => q + 1)}
                          onRemove={() => setQty((q) => Math.max(1, q - 1))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="space-y-3">
                    {/* Add To Cart Primary Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={processing || !fooditem.status}
                      className={`w-full py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${!fooditem.status
                          ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                          : added
                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                            : 'bg-[#20e0a1] hover:bg-[#1ccb92] text-slate-950 shadow-[#20e0a1]/25 active:scale-[0.99] cursor-pointer'
                        }`}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Adding to Cart...</span>
                        </>
                      ) : added ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <span>
                          + Add {qty} to Cart • {Money(lineTotalPrice)}
                        </span>
                      )}
                    </button>

                    {/* Secondary Actions (Wishlist & Share) */}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className="flex-1 py-3 rounded-2xl bg-white dark:bg-[#0d1117] hover:bg-slate-100 dark:hover:bg-slate-900 border border-black/5 dark:border-white/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${isWishlisted
                              ? 'fill-red-500 text-red-500'
                              : 'text-slate-600 dark:text-slate-400'
                            }`}
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isWishlisted ? 'Saved' : 'Save'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShare}
                        className="flex-1 py-3 rounded-2xl bg-white dark:bg-[#0d1117] hover:bg-slate-100 dark:hover:bg-slate-900 border border-black/5 dark:border-white/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Share
                        </span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Additional Item Information */}
            <div className="mt-12">
              <h2
                className="text-2xl font-bold text-slate-900 dark:text-white mb-6"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                About This Item
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoCard
                  label="Category"
                  value={subCategory?.title || 'Uncategorized'}
                />
                <InfoCard
                  label="Total Summary"
                  value={`${qty}x • ${Money(lineTotalPrice)}`}
                  accent
                />
                <InfoCard
                  label="Status"
                  value={fooditem.status ? 'Available' : 'Out of Stock'}
                  statusColor={fooditem.status ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}
                />
              </div>
            </div>
          </main>
        </div>
      </div>

      {totalQuantity > 0 && !cartOpen && (
        <FloatingCartBar
          totalQuantity={totalQuantity}
          subtotal={totalPrice}
          onOpenCart={() => setCartOpen(true)}
        />
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onClose={() => setCartOpen(false)}
          onOrder={placeOrder}
          ordered={ordered}
          money={Money}
          itemImage={(item) => item.images?.[0] || null}
          itemEmoji={(item) => item.tags?.[0] || '🍽️'}
        />
      )}
    </>
  )
}

/* Helper Info Card Component */
function InfoCard({
  label,
  value,
  accent = false,
  statusColor,
}: {
  label: string
  value: string
  accent?: boolean
  statusColor?: string
}) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#161b22] border border-slate-200/60 dark:border-slate-800 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
        {label}
      </p>
      <p
        className={`text-base font-semibold ${accent
            ? 'text-[#00a37a] dark:text-[#6bffb8]'
            : statusColor || 'text-slate-900 dark:text-white'
          }`}
      >
        {value}
      </p>
    </div>
  )
}