import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface User {
  id: string
  email: string
  name: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  phone?: string
  avatar?: string
  storeName?: string
  storeDesc?: string
  storeBanner?: string
  storeLogo?: string
  balance: number
  loyaltyPoints: number
  isVerified: boolean
  bio?: string
  website?: string
  address?: string
  city?: string
  country?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  slug?: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  videos?: string[]
  category: string
  subCategory?: string
  brand?: string
  condition: string
  stock: number
  sellerId: string
  seller?: User
  status: string
  views: number
  featured: boolean
  tags?: string[]
  variants?: ProductVariant[]
  specifications?: Record<string, string>
  rating: number
  reviewCount: number
  soldCount: number
  flashSale?: FlashSale
  createdAt: string
}

export interface ProductVariant {
  id: string
  size?: string
  color?: string
  stock: number
  price?: number
  sku?: string
}

export interface FlashSale {
  id: string
  salePrice: number
  quantity: number
  sold: number
  startTime: string
  endTime: string
  isActive: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  variant?: ProductVariant
}

export interface Order {
  id: string
  orderNumber: string
  buyerId: string
  buyer?: User
  items: OrderItem[]
  totalAmount: number
  discount: number
  shipping: number
  commission: number
  sellerEarnings: number
  status: string
  paymentMethod: string
  paymentStatus: string
  shippingAddress?: string
  buyerPhone?: string
  notes?: string
  trackingNumber?: string
  estimatedDelivery?: string
  deliveredAt?: string
  loyaltyEarned: number
  createdAt: string
}

export interface OrderItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
  sellerId: string
  variant?: ProductVariant
}

export interface Review {
  id: string
  productId: string
  userId: string
  user?: User
  rating: number
  title?: string
  comment: string
  images?: string[]
  isVerified: boolean
  helpful: number
  createdAt: string
}

export interface WishlistItem {
  id: string
  productId: string
  product?: Product
  createdAt: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  image?: string
  isRead: boolean
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  sender?: User
  receiverId: string
  receiver?: User
  productId?: string
  subject?: string
  message: string
  attachments?: string[]
  isRead: boolean
  createdAt: string
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minPurchase?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  startDate: string
  endDate: string
  isActive: boolean
  description?: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  authorId: string
  author?: User
  category?: string
  tags?: string[]
  status: 'draft' | 'published'
  views: number
  publishedAt?: string
  createdAt: string
}

// ==================== NEW TYPES ====================

export interface ReturnRequest {
  id: string
  orderId: string
  orderItemId: string
  userId: string
  sellerId: string
  reason: string
  description?: string
  images?: string[]
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  refundAmount: number
  refundMethod: string
  adminNotes?: string
  createdAt: string
}

export interface GiftCard {
  id: string
  code: string
  amount: number
  purchasedBy?: string
  recipientEmail?: string
  recipientName?: string
  message?: string
  isUsed: boolean
  usedBy?: string
  expiresAt?: string
  isActive: boolean
  createdAt: string
}

export interface Referral {
  id: string
  referrerId: string
  referralCode: string
  referredId?: string
  status: 'pending' | 'completed' | 'rewarded'
  rewardAmount: number
  isRewarded: boolean
  createdAt: string
}

export interface PriceAlert {
  id: string
  userId: string
  productId: string
  product?: Product
  targetPrice: number
  isNotified: boolean
  isActive: boolean
  createdAt: string
}

export interface RecentlyViewedItem {
  id: string
  productId: string
  product?: Product
  viewedAt: string
}

export interface CompareProduct {
  id: string
  productId: string
  product?: Product
  addedAt: string
}

export interface ProductQuestion {
  id: string
  productId: string
  userId: string
  user?: User
  question: string
  answer?: string
  answeredBy?: string
  isAnswered: boolean
  isHelpful: number
  createdAt: string
}

export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  address: string
  city: string
  state?: string
  country: string
  postalCode?: string
  isDefault: boolean
  addressType: 'shipping' | 'billing'
  createdAt: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  banner?: string
  description?: string
  website?: string
  isActive: boolean
  createdAt: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  productIds: string[]
  isActive: boolean
  createdAt: string
}

export interface SizeGuide {
  id: string
  category: string
  subCategory?: string
  brand?: string
  guideData: string
  instructions?: string
  isActive: boolean
}

export interface HelpArticle {
  id: string
  title: string
  slug: string
  content: string
  category: string
  order: number
  isPublished: boolean
  views: number
  createdAt: string
}

export interface HelpCategory {
  id: string
  name: string
  slug: string
  icon?: string
  order: number
  isActive: boolean
}

export interface Announcement {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'promotion'
  link?: string
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt: string
}

// Auth Store
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      }))
    }),
    { name: 'auth-storage' }
  )
)

// Cart Store
interface CartState {
  items: CartItem[]
  appliedCoupon: Coupon | null
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  applyCoupon: (coupon: Coupon | null) => void
  getSubtotal: () => number
  getDiscount: () => number
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      addItem: (product, quantity = 1, variant) => set((state) => {
        const existingItem = state.items.find(item => 
          item.product.id === product.id && 
          (!variant || JSON.stringify(item.variant) === JSON.stringify(variant))
        )
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.product.id === product.id && 
              (!variant || JSON.stringify(item.variant) === JSON.stringify(variant))
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }
        }
        return { items: [...state.items, { product, quantity, variant }] }
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId)
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        items: quantity > 0
          ? state.items.map(item =>
              item.product.id === productId ? { ...item, quantity } : item
            )
          : state.items.filter(item => item.product.id !== productId)
      })),
      clearCart: () => set({ items: [], appliedCoupon: null }),
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      getSubtotal: () => get().items.reduce((sum, item) => {
        const price = item.variant?.price || item.product.price
        return sum + price * item.quantity
      }, 0),
      getDiscount: () => {
        const { items, appliedCoupon } = get()
        if (!appliedCoupon) return 0
        const subtotal = get().getSubtotal()
        if (appliedCoupon.minPurchase && subtotal < appliedCoupon.minPurchase) return 0
        let discount = appliedCoupon.type === 'percentage' 
          ? subtotal * (appliedCoupon.value / 100)
          : appliedCoupon.value
        if (appliedCoupon.maxDiscount) discount = Math.min(discount, appliedCoupon.maxDiscount)
        return discount
      },
      getTotal: () => get().getSubtotal() - get().getDiscount(),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0)
    }),
    { name: 'cart-storage' }
  )
)

// Wishlist Store
interface WishlistState {
  items: WishlistItem[]
  setItems: (items: WishlistItem[]) => void
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      addItem: (product) => set((state) => {
        if (state.items.find(item => item.productId === product.id)) return state
        return { 
          items: [...state.items, { 
            id: Date.now().toString(), 
            productId: product.id, 
            product,
            createdAt: new Date().toISOString() 
          }] 
        }
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.productId !== productId)
      })),
      isInWishlist: (productId) => !!get().items.find(item => item.productId === productId),
      getItemCount: () => get().items.length
    }),
    { name: 'wishlist-storage' }
  )
)

// UI Store
interface UIState {
  currentView: 'home' | 'shop' | 'seller' | 'orders' | 'admin' | 'wishlist' | 'messages' | 'profile' | 'blog' | 'about' | 'faq' | 'seller-store' | 'help' | 'compare' | 'returns' | 'giftcards' | 'referrals' | 'price-alerts' | 'addresses' | 'brands' | 'collections' | 'deals' | 'new-arrivals' | 'best-sellers' | 'flash-sale' | 'size-guide' | 'contact' | 'privacy' | 'terms'
  selectedProduct: Product | null
  selectedSeller: User | null
  searchQuery: string
  selectedCategory: string
  priceRange: [number, number]
  selectedBrands: string[]
  selectedConditions: string[]
  sortBy: 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating'
  viewMode: 'grid' | 'list'
  showLoginModal: boolean
  showCart: boolean
  showProductModal: boolean
  showFilters: boolean
  darkMode: boolean
  setCurrentView: (view: UIState['currentView']) => void
  setSelectedProduct: (product: Product | null) => void
  setSelectedSeller: (seller: User | null) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  setPriceRange: (range: [number, number]) => void
  setSelectedBrands: (brands: string[]) => void
  setSelectedConditions: (conditions: string[]) => void
  setSortBy: (sort: UIState['sortBy']) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setShowLoginModal: (show: boolean) => void
  setShowCart: (show: boolean) => void
  setShowProductModal: (show: boolean) => void
  setShowFilters: (show: boolean) => void
  toggleDarkMode: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentView: 'home',
      selectedProduct: null,
      selectedSeller: null,
      searchQuery: '',
      selectedCategory: 'all',
      priceRange: [0, 10000],
      selectedBrands: [],
      selectedConditions: [],
      sortBy: 'newest',
      viewMode: 'grid',
      showLoginModal: false,
      showCart: false,
      showProductModal: false,
      showFilters: false,
      darkMode: false,
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setSelectedSeller: (seller) => set({ selectedSeller: seller }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setPriceRange: (range) => set({ priceRange: range }),
      setSelectedBrands: (brands) => set({ selectedBrands: brands }),
      setSelectedConditions: (conditions) => set({ selectedConditions: conditions }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setShowLoginModal: (show) => set({ showLoginModal: show }),
      setShowCart: (show) => set({ showCart: show }),
      setShowProductModal: (show) => set({ showProductModal: show }),
      setShowFilters: (show) => set({ showFilters: show }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
    }),
    { name: 'ui-storage', partialize: (state) => ({ darkMode: state.darkMode, viewMode: state.viewMode }) }
  )
)

// ==================== NEW STORES ====================

// Compare Store - for product comparison
interface CompareState {
  items: CompareProduct[]
  maxItems: number
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearAll: () => void
  hasItem: (productId: string) => boolean
  getItemCount: () => number
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 4,
      addItem: (product) => set((state) => {
        if (state.items.length >= state.maxItems) return state
        if (state.items.find(item => item.productId === product.id)) return state
        return { 
          items: [...state.items, { 
            id: Date.now().toString(), 
            productId: product.id, 
            product,
            addedAt: new Date().toISOString() 
          }] 
        }
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.productId !== productId)
      })),
      clearAll: () => set({ items: [] }),
      hasItem: (productId) => !!get().items.find(item => item.productId === productId),
      getItemCount: () => get().items.length
    }),
    { name: 'compare-storage' }
  )
)

// Recently Viewed Store
interface RecentlyViewedState {
  items: RecentlyViewedItem[]
  maxItems: number
  addItem: (product: Product) => void
  clearAll: () => void
  getItems: () => RecentlyViewedItem[]
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 20,
      addItem: (product) => set((state) => {
        const filtered = state.items.filter(item => item.productId !== product.id)
        const newItems = [
          { 
            id: Date.now().toString(), 
            productId: product.id, 
            product,
            viewedAt: new Date().toISOString() 
          },
          ...filtered
        ].slice(0, state.maxItems)
        return { items: newItems }
      }),
      clearAll: () => set({ items: [] }),
      getItems: () => get().items
    }),
    { name: 'recently-viewed-storage' }
  )
)

// Address Store
interface AddressState {
  addresses: Address[]
  selectedAddress: Address | null
  setAddresses: (addresses: Address[]) => void
  addAddress: (address: Address) => void
  updateAddress: (id: string, updates: Partial<Address>) => void
  removeAddress: (id: string) => void
  setSelectedAddress: (address: Address | null) => void
  setDefault: (id: string) => void
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],
      selectedAddress: null,
      setAddresses: (addresses) => set({ addresses }),
      addAddress: (address) => set((state) => ({ 
        addresses: [...state.addresses, address] 
      })),
      updateAddress: (id, updates) => set((state) => ({ 
        addresses: state.addresses.map(addr => 
          addr.id === id ? { ...addr, ...updates } : addr
        ) 
      })),
      removeAddress: (id) => set((state) => ({ 
        addresses: state.addresses.filter(addr => addr.id !== id) 
      })),
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      setDefault: (id) => set((state) => ({ 
        addresses: state.addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        })) 
      }))
    }),
    { name: 'address-storage' }
  )
)

// Price Alerts Store
interface PriceAlertState {
  alerts: PriceAlert[]
  setAlerts: (alerts: PriceAlert[]) => void
  addAlert: (alert: PriceAlert) => void
  removeAlert: (id: string) => void
  toggleActive: (id: string) => void
}

export const usePriceAlertStore = create<PriceAlertState>()(
  persist(
    (set) => ({
      alerts: [],
      setAlerts: (alerts) => set({ alerts }),
      addAlert: (alert) => set((state) => ({ 
        alerts: [...state.alerts, alert] 
      })),
      removeAlert: (id) => set((state) => ({ 
        alerts: state.alerts.filter(alert => alert.id !== id) 
      })),
      toggleActive: (id) => set((state) => ({ 
        alerts: state.alerts.map(alert => 
          alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
        ) 
      }))
    }),
    { name: 'price-alert-storage' }
  )
)

// Gift Card Store (for redemption during checkout)
interface GiftCardState {
  appliedGiftCard: GiftCard | null
  applyGiftCard: (card: GiftCard | null) => void
  getGiftCardBalance: () => number
}

export const useGiftCardStore = create<GiftCardState>()(
  persist(
    (set, get) => ({
      appliedGiftCard: null,
      applyGiftCard: (card) => set({ appliedGiftCard: card }),
      getGiftCardBalance: () => get().appliedGiftCard?.amount || 0
    }),
    { name: 'giftcard-storage' }
  )
)

// Referral Store
interface ReferralState {
  referralCode: string | null
  referralStats: { total: number; completed: number; earned: number } | null
  setReferralCode: (code: string | null) => void
  setReferralStats: (stats: { total: number; completed: number; earned: number } | null) => void
}

export const useReferralStore = create<ReferralState>()(
  persist(
    (set) => ({
      referralCode: null,
      referralStats: null,
      setReferralCode: (code) => set({ referralCode: code }),
      setReferralStats: (stats) => set({ referralStats: stats })
    }),
    { name: 'referral-storage' }
  )
)
