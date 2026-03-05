'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, User, Search, Menu, X, Heart, Star, Plus, Minus, 
  Trash2, Package, TrendingUp, Users, DollarSign, Eye, Edit, 
  ChevronRight, ChevronLeft, Filter, Grid, List, Bell, Settings,
  LogOut, Store, ShoppingBag, Truck, CheckCircle, Clock, AlertCircle,
  Upload, Image as ImageIcon, Save, ArrowRight, Sparkles, Crown,
  ThumbsUp, MessageCircle, Share2, Bookmark, MapPin, Phone, Mail,
  Globe, Instagram, Twitter, Facebook, Youtube, ExternalLink,
  Gift, Percent, Tag, Clock3, Zap, Award, Shield, BadgeCheck,
  BarChart3, PieChart, Activity, TrendingDown, Wallet, CreditCard,
  FileText, HelpCircle, Info, Send, Paperclip, Smile, MoreHorizontal,
  HeartHandshake, Users2, Briefcase, BookOpen, Home, Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { 
  useAuthStore, useCartStore, useUIStore, useWishlistStore,
  type Product, type User as UserType, type Review, type Message, type Notification, type Coupon, type Blog
} from '@/lib/store'

// Categories with rich data
const categories = [
  { id: 'all', name: 'All Products', icon: '🛍️', color: 'from-purple-500 to-pink-500', description: 'Browse everything' },
  { id: 'shoes', name: 'Shoes', icon: '👟', color: 'from-blue-500 to-cyan-500', description: 'Sneakers, boots, heels & more' },
  { id: 'clothes', name: 'Clothing', icon: '👕', color: 'from-green-500 to-emerald-500', description: 'Tops, bottoms, dresses' },
  { id: 'accessories', name: 'Accessories', icon: '👜', color: 'from-orange-500 to-amber-500', description: 'Bags, jewelry, watches' },
]

const subCategories: Record<string, {id: string, name: string}[]> = {
  shoes: [
    { id: 'sneakers', name: 'Sneakers' },
    { id: 'boots', name: 'Boots' },
    { id: 'heels', name: 'Heels' },
    { id: 'formal', name: 'Formal' },
    { id: 'casual', name: 'Casual' },
  ],
  clothes: [
    { id: 't-shirts', name: 'T-Shirts' },
    { id: 'jeans', name: 'Jeans' },
    { id: 'dresses', name: 'Dresses' },
    { id: 'jackets', name: 'Jackets' },
    { id: 'hoodies', name: 'Hoodies' },
    { id: 'shorts', name: 'Shorts' },
    { id: 'sweaters', name: 'Sweaters' },
  ],
  accessories: [
    { id: 'bags', name: 'Bags' },
    { id: 'jewelry', name: 'Jewelry' },
    { id: 'watches', name: 'Watches' },
    { id: 'sunglasses', name: 'Sunglasses' },
    { id: 'belts', name: 'Belts' },
    { id: 'hats', name: 'Hats' },
  ]
}

const conditionColors: Record<string, string> = {
  new: 'bg-green-100 text-green-700 border-green-200',
  'like-new': 'bg-blue-100 text-blue-700 border-blue-200',
  good: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  fair: 'bg-orange-100 text-orange-700 border-orange-200',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

// Helper function to ensure array
const ensureArray = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) return (data as any).data
  return []
}

export default function Marketplace() {
  // State - all initialized as empty arrays
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settings, setSettings] = useState({ platformName: 'StyleHub', commissionRate: 0.10, loyaltyRate: 0.01 })
  const [orders, setOrders] = useState<any[]>([])
  const [sellerProducts, setSellerProducts] = useState<Product[]>([])
  const [sellerOrders, setSellerOrders] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<UserType[]>([])
  const [stats, setStats] = useState({ totalProducts: 0, totalSales: 0, totalUsers: 0, totalRevenue: 0 })
  const [reviews, setReviews] = useState<Review[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<any[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  // Stores
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore()
  const { items, addItem, removeItem, updateQuantity, clearCart, applyCoupon, appliedCoupon, getSubtotal, getDiscount, getTotal, getItemCount } = useCartStore()
  const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist, getItemCount: getWishlistCount } = useWishlistStore()
  const { 
    currentView, setCurrentView, selectedProduct, setSelectedProduct,
    selectedSeller, setSelectedSeller, searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory, sortBy, setSortBy,
    viewMode, setViewMode, showLoginModal, setShowLoginModal,
    showCart, setShowCart, showProductModal, setShowProductModal,
    showFilters, setShowFilters, darkMode, toggleDarkMode
  } = useUIStore()

  // Form states
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({
    name: '', email: '', password: '', role: 'BUYER',
    storeName: '', storeDesc: '', phone: ''
  })
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', comparePrice: '',
    category: 'clothes', subCategory: '', brand: '',
    condition: 'new', stock: '1', images: [] as string[],
    tags: '', specifications: ''
  })
  const [checkoutForm, setCheckoutForm] = useState({
    shippingAddress: '', buyerPhone: '', notes: '', couponCode: ''
  })
  const [reviewForm, setReviewForm] = useState({
    rating: 5, title: '', comment: ''
  })
  const [messageForm, setMessageForm] = useState({
    receiverId: '', subject: '', message: ''
  })

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      params.append('sort', sortBy)
      
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(ensureArray<Product>(data))
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, searchQuery, sortBy])

  // Fetch blogs - separate function that runs on mount
  const fetchBlogs = useCallback(async () => {
    try {
      const res = await fetch('/api/blog')
      const data = await res.json()
      setBlogs(ensureArray<Blog>(data))
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
      setBlogs([])
    }
  }, [])

  // Fetch coupons - separate function for public coupons
  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/coupons')
      const data = await res.json()
      setCoupons(ensureArray<Coupon>(data))
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      setCoupons([])
    }
  }, [])

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated || !user) return
    
    try {
      // Fetch notifications
      const notifRes = await fetch(`/api/notifications?userId=${user.id}`)
      const notifData = await notifRes.json()
      setNotifications(ensureArray(notifData.notifications || notifData))
      setUnreadCount(notifData.unreadCount || 0)

      // Fetch followers/following count
      const followRes = await fetch(`/api/follow?userId=${user.id}`)
      const followData = await followRes.json()
      setFollowersCount(followData.followersCount || 0)
      setFollowingCount(followData.followingCount || 0)

      if (user.role === 'SELLER') {
        const [productsRes, ordersRes] = await Promise.all([
          fetch(`/api/products?sellerId=${user.id}`),
          fetch(`/api/orders?sellerId=${user.id}`)
        ])
        setSellerProducts(ensureArray<Product>(await productsRes.json()))
        setSellerOrders(ensureArray(await ordersRes.json()))
      }

      if (user.role === 'BUYER') {
        const ordersRes = await fetch(`/api/orders?buyerId=${user.id}`)
        setOrders(ensureArray(await ordersRes.json()))
      }

      if (user.role === 'ADMIN') {
        const [usersRes, productsRes, ordersRes, couponsRes, blogsRes, settingsRes] = await Promise.all([
          fetch('/api/auth'),
          fetch('/api/products'),
          fetch('/api/orders'),
          fetch('/api/coupons'),
          fetch('/api/blog'),
          fetch('/api/settings')
        ])
        const usersData = await usersRes.json()
        const productsData = await productsRes.json()
        const ordersData = await ordersRes.json()
        setAllUsers(ensureArray(usersData))
        setCoupons(ensureArray(await couponsRes.json()))
        setBlogs(ensureArray(await blogsRes.json()))
        setSettings(await settingsRes.json())
        setStats({
          totalProducts: ensureArray(productsData).length,
          totalSales: ensureArray(ordersData).filter((o: any) => o.status === 'delivered').length,
          totalUsers: ensureArray(usersData).length,
          totalRevenue: ensureArray(ordersData).reduce((sum: number, o: any) => sum + (o.commission || 0), 0)
        })
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }, [isAuthenticated, user])

  // Effects
  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { fetchBlogs() }, [fetchBlogs])
  useEffect(() => { fetchCoupons() }, [fetchCoupons])
  useEffect(() => { fetchUserData() }, [fetchUserData])

  // Seed data on first load
  useEffect(() => {
    const seedDatabase = async () => {
      try {
        await fetch('/api/seed', { method: 'POST' })
        fetchProducts()
        fetchBlogs()
        fetchCoupons()
      } catch (error) {
        // Data might already exist
      }
    }
    seedDatabase()
  }, [])

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', ...authForm })
      })
      const data = await res.json()
      if (data.error) return toast.error(data.error)
      login(data.user, data.token)
      setShowLoginModal(false)
      toast.success(`Welcome back, ${data.user.name}!`)
    } catch (error) {
      toast.error('Login failed')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...authForm })
      })
      const data = await res.json()
      if (data.error) return toast.error(data.error)
      login(data.user, data.token)
      setShowLoginModal(false)
      toast.success(`Welcome to StyleHub, ${data.user.name}!`)
    } catch (error) {
      toast.error('Registration failed')
    }
  }

  const handleLogout = () => {
    logout()
    setCurrentView('home')
    toast.success('Logged out successfully')
  }

  // Product handlers
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...productForm, sellerId: user.id })
      })
      toast.success('Product listed successfully!')
      setProductForm({ name: '', description: '', price: '', comparePrice: '', category: 'clothes', subCategory: '', brand: '', condition: 'new', stock: '1', images: [], tags: '', specifications: '' })
      fetchUserData()
    } catch (error) {
      toast.error('Failed to add product')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await fetch(`/api/products?id=${productId}`, { method: 'DELETE' })
      toast.success('Product deleted')
      fetchUserData()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  // Wishlist handlers
  const toggleWishlist = async (product: Product) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist!')
    }
  }

  // Cart handlers
  const handleCheckout = async () => {
    if (!user) return setShowLoginModal(true)
    if (!checkoutForm.shippingAddress || !checkoutForm.buyerPhone) return toast.error('Please fill in delivery details')

    try {
      // Validate coupon if applied
      if (appliedCoupon) {
        await fetch('/api/coupons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, couponId: appliedCoupon.id })
        })
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user.id,
          items: items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
          shippingAddress: checkoutForm.shippingAddress,
          buyerPhone: checkoutForm.buyerPhone,
          notes: checkoutForm.notes,
          paymentMethod: 'cash'
        })
      })

      if (res.ok) {
        toast.success('Order placed successfully!')
        clearCart()
        setShowCart(false)
        setCheckoutForm({ shippingAddress: '', buyerPhone: '', notes: '', couponCode: '' })
        fetchUserData()
      }
    } catch (error) {
      toast.error('Failed to place order')
    }
  }

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!user || !checkoutForm.couponCode) return
    
    try {
      const res = await fetch(`/api/coupons?code=${checkoutForm.couponCode}&userId=${user.id}`)
      const data = await res.json()
      if (data.error) return toast.error(data.error)
      applyCoupon(data)
      toast.success('Coupon applied!')
    } catch (error) {
      toast.error('Invalid coupon')
    }
  }

  // Order status update
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      })
      toast.success(`Order ${status}`)
      fetchUserData()
    } catch (error) {
      toast.error('Failed to update order')
    }
  }

  // Submit review
  const submitReview = async () => {
    if (!user || !selectedProduct) return
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          userId: user.id,
          ...reviewForm
        })
      })
      toast.success('Review submitted!')
      setReviewForm({ rating: 5, title: '', comment: '' })
      // Refresh reviews
      const res = await fetch(`/api/reviews?productId=${selectedProduct.id}`)
      setReviews(ensureArray(await res.json()))
    } catch (error) {
      toast.error('Failed to submit review')
    }
  }

  // Follow seller
  const toggleFollow = async (sellerId: string) => {
    if (!user) return setShowLoginModal(true)
    try {
      await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: user.id, followingId: sellerId })
      })
      fetchUserData()
    } catch (error) {
      toast.error('Failed to follow')
    }
  }

  // Helper functions
  const getDiscountPercentage = (price: number, comparePrice?: number) => {
    if (!comparePrice) return null
    return Math.round((1 - price / comparePrice) * 100)
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-slate-900/90' : 'bg-white/80'} backdrop-blur-xl border-b ${darkMode ? 'border-slate-800' : 'border-slate-200/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setCurrentView('home')}
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Crown className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                StyleHub
              </span>
            </motion.div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search for shoes, clothes, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-full border-0 focus:ring-2 focus:ring-purple-500 transition-all ${darkMode ? 'bg-slate-800 text-white placeholder-slate-400' : 'bg-slate-100'}`}
                />
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {[
                  { view: 'home', icon: Home, label: 'Home' },
                  { view: 'shop', icon: ShoppingBag, label: 'Shop' },
                  { view: 'blog', icon: BookOpen, label: 'Blog' },
                ].map(({ view, icon: Icon, label }) => (
                  <Button
                    key={view}
                    variant="ghost"
                    onClick={() => setCurrentView(view as any)}
                    className={`${currentView === view ? (darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700') : ''} ${darkMode ? 'text-slate-300 hover:text-white' : ''}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
                
                {isAuthenticated && user?.role === 'SELLER' && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView('seller')}
                    className={`${currentView === 'seller' ? (darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700') : ''} ${darkMode ? 'text-slate-300 hover:text-white' : ''}`}
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                
                {isAuthenticated && user?.role === 'BUYER' && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentView('orders')}
                      className={`${currentView === 'orders' ? (darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700') : ''} ${darkMode ? 'text-slate-300 hover:text-white' : ''}`}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Orders
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentView('wishlist')}
                      className={`${currentView === 'wishlist' ? (darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700') : ''} ${darkMode ? 'text-slate-300 hover:text-white' : ''}`}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlist
                      {getWishlistCount() > 0 && (
                        <Badge className="ml-1 bg-pink-500 text-white">{getWishlistCount()}</Badge>
                      )}
                    </Button>
                  </>
                )}
                
                {isAuthenticated && user?.role === 'ADMIN' && (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentView('admin')}
                    className={`${currentView === 'admin' ? (darkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700') : ''} ${darkMode ? 'text-slate-300 hover:text-white' : ''}`}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
              </nav>

              {/* Dark Mode Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleDarkMode}
                      className="rounded-full"
                    >
                      {darkMode ? '☀️' : '🌙'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle theme</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Notifications */}
              {isAuthenticated && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full"
                        onClick={async () => {
                          await fetch('/api/notifications', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user?.id, markAllRead: true })
                          })
                          setUnreadCount(0)
                        }}
                      >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{unreadCount} new notifications</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Cart Button */}
              <Button
                variant="outline"
                size="icon"
                className={`relative rounded-full ${darkMode ? 'border-slate-700' : ''}`}
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="w-5 h-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block text-right">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} capitalize`}>{user?.role}</p>
                    {user?.loyaltyPoints && user.loyaltyPoints > 0 && (
                      <p className="text-xs text-purple-500">⭐ {user.loyaltyPoints} points</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="rounded-full"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-full px-6"
                >
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-full border-0 focus:ring-2 focus:ring-purple-500 ${darkMode ? 'bg-slate-800 text-white placeholder-slate-400' : 'bg-slate-100'}`}
              />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`lg:hidden ${darkMode ? 'bg-slate-900' : 'bg-white'} border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}
            >
              <div className="p-4 space-y-2">
                {['home', 'shop', 'blog'].map((view) => (
                  <Button key={view} variant="ghost" className="w-full justify-start capitalize" onClick={() => { setCurrentView(view as any); setMobileMenuOpen(false) }}>
                    {view}
                  </Button>
                ))}
                {isAuthenticated && user?.role === 'SELLER' && (
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentView('seller'); setMobileMenuOpen(false) }}>
                    <Store className="w-4 h-4 mr-2" /> Seller Dashboard
                  </Button>
                )}
                {isAuthenticated && user?.role === 'BUYER' && (
                  <>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentView('orders'); setMobileMenuOpen(false) }}>
                      <Package className="w-4 h-4 mr-2" /> My Orders
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentView('wishlist'); setMobileMenuOpen(false) }}>
                      <Heart className="w-4 h-4 mr-2" /> Wishlist
                    </Button>
                  </>
                )}
                {isAuthenticated && user?.role === 'ADMIN' && (
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false) }}>
                    <Settings className="w-4 h-4 mr-2" /> Admin Panel
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* HOME VIEW */}
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {/* Hero Section */}
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              
                <div className="relative px-8 py-16 lg:py-24">
                  <div className="max-w-3xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        #1 Fashion Marketplace
                      </Badge>
                    </motion.div>
                    
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                      Discover Your
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">Perfect Style</span>
                    </motion.h1>
                    
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-lg lg:text-xl text-purple-100 mb-8 max-w-2xl">
                      Shop from thousands of trusted sellers. Find unique fashion pieces, from trendy sneakers to elegant evening wear. Quality guaranteed.
                    </motion.p>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-4">
                      <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 rounded-full px-8 shadow-xl" onClick={() => setCurrentView('shop')}>
                        Start Shopping <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 rounded-full px-8" onClick={() => { setShowLoginModal(true); setAuthTab('register'); setAuthForm(prev => ({ ...prev, role: 'SELLER' })) }}>
                        <Store className="w-5 h-5 mr-2" /> Become a Seller
                      </Button>
                    </motion.div>
                  </div>

                  {/* Stats */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-12 grid grid-cols-3 gap-4 max-w-lg">
                    {[
                      { value: '50K+', label: 'Products' },
                      { value: '2K+', label: 'Sellers' },
                      { value: '100K+', label: 'Happy Buyers' }
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                        <div className="text-sm text-purple-200">{stat.label}</div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-fuchsia-500/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-500/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              </section>

              {/* Flash Sale Banner */}
              <section className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 lg:p-8 text-white">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Zap className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold">🔥 Flash Sale Active!</h3>
                      <p className="text-orange-100">Up to 50% off on selected items</p>
                    </div>
                  </div>
                  <Button className="bg-white text-orange-600 hover:bg-orange-50 rounded-full px-8" onClick={() => setCurrentView('shop')}>
                    Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </section>

              {/* Categories */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Shop by Category</h2>
                  <Button variant="ghost" onClick={() => setCurrentView('shop')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {categories.slice(1).map((category, i) => (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      onClick={() => { setSelectedCategory(category.id); setCurrentView('shop') }}
                      className="relative overflow-hidden rounded-2xl cursor-pointer group"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`} />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      <div className="relative p-6 lg:p-8 text-white">
                        <span className="text-4xl lg:text-5xl mb-4 block">{category.icon}</span>
                        <h3 className="text-lg lg:text-xl font-semibold">{category.name}</h3>
                        <p className="text-white/80 text-sm mt-1">{category.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Featured Products */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>🔥 Trending Now</h2>
                    <p className={`mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Most popular items this week</p>
                  </div>
                  <Button variant="ghost" onClick={() => setCurrentView('shop')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {products.filter(p => p.featured).slice(0, 8).map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group cursor-pointer"
                      onClick={() => { setSelectedProduct(product); setShowProductModal(true) }}
                    >
                      <div className={`relative aspect-square rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} mb-3`}>
                        <img src={product.images?.[0] || '/api/placeholder/400/400'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        {product.comparePrice && (
                          <Badge className="absolute top-3 left-3 bg-red-500 text-white">-{getDiscountPercentage(product.price, product.comparePrice)}%</Badge>
                        )}
                        {product.soldCount && product.soldCount > 50 && (
                          <Badge className="absolute top-3 right-3 bg-orange-500 text-white">Hot</Badge>
                        )}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button size="icon" className="rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg" onClick={(e) => { e.stopPropagation(); toggleWishlist(product) }}>
                            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                          <Button size="icon" className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" onClick={(e) => { e.stopPropagation(); addItem(product); toast.success('Added to cart!') }}>
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-1`}>{product.brand}</p>
                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'} line-clamp-1`}>{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-lg text-purple-600">${product.price.toFixed(2)}</span>
                          {product.comparePrice && <span className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'} line-through`}>${product.comparePrice.toFixed(2)}</span>}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                          ))}
                          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} ml-1`}>({product.reviewCount})</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Why Choose Us */}
              <section className={`${darkMode ? 'bg-slate-800' : 'bg-slate-900'} rounded-3xl p-8 lg:p-12`}>
                <div className="text-center mb-12">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">Why Shop on StyleHub?</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">We're committed to providing the best shopping experience</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { icon: Shield, title: 'Buyer Protection', desc: 'Full refund if item doesn\'t match description', color: 'from-blue-500 to-cyan-500' },
                    { icon: Truck, title: 'Fast Delivery', desc: 'Sellers ship within 24-48 hours', color: 'from-green-500 to-emerald-500' },
                    { icon: BadgeCheck, title: 'Verified Sellers', desc: 'All sellers are verified for authenticity', color: 'from-purple-500 to-pink-500' },
                    { icon: Gift, title: 'Loyalty Rewards', desc: 'Earn points on every purchase', color: 'from-orange-500 to-amber-500' },
                  ].map((feature, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-slate-400 text-sm">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Become a Seller CTA */}
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-orange-500">
                <div className="relative px-8 py-12 lg:py-16">
                  <div className="max-w-2xl">
                    <Badge className="mb-4 bg-white/20 text-white border-white/30">Start Earning Today</Badge>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Turn Your Fashion Into Fortune 💰</h2>
                    <p className="text-lg text-orange-100 mb-8">
                      Join thousands of successful sellers. List your products for FREE and reach millions of buyers. 
                      Keep {((1 - settings.commissionRate) * 100).toFixed(0)}% of your sales!
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 rounded-full px-8" onClick={() => { setShowLoginModal(true); setAuthTab('register'); setAuthForm(prev => ({ ...prev, role: 'SELLER' })) }}>
                        <Store className="w-5 h-5 mr-2" /> Open Your Free Store
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              </section>

              {/* Blog Preview */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className={`text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>From Our Blog</h2>
                    <p className={`mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Style tips and fashion insights</p>
                  </div>
                  <Button variant="ghost" onClick={() => setCurrentView('blog')}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {blogs.length > 0 ? blogs.slice(0, 3).map((blog, i) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}
                    >
                      <div className={`aspect-video ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                        <img src={blog.coverImage || '/api/placeholder/400/200'} alt={blog.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-6">
                        <Badge variant="outline" className={`mb-2 ${darkMode ? 'border-slate-600' : ''}`}>{blog.category}</Badge>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'} mb-2 line-clamp-2`}>{blog.title}</h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} line-clamp-2`}>{blog.excerpt}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center col-span-3`}>
                      <BookOpen className={`w-12 h-12 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
                      <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>No blog posts yet. Check back soon!</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* SHOP VIEW */}
          {currentView === 'shop' && (
            <motion.div key="shop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-24 space-y-6">
                  {/* Categories */}
                  <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                    <CardHeader>
                      <CardTitle className={`text-lg ${darkMode ? 'text-white' : ''}`}>Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat.id}
                          variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                          className={`w-full justify-start ${selectedCategory === cat.id ? 'bg-purple-600 text-white' : darkMode ? 'text-slate-300 hover:text-white' : ''}`}
                          onClick={() => setSelectedCategory(cat.id)}
                        >
                          <span className="mr-2">{cat.icon}</span>
                          {cat.name}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Sub Categories */}
                  {selectedCategory !== 'all' && subCategories[selectedCategory] && (
                    <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                      <CardHeader>
                        <CardTitle className={`text-lg ${darkMode ? 'text-white' : ''}`}>Type</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {subCategories[selectedCategory].map((sub) => (
                          <Button key={sub.id} variant="ghost" className={`w-full justify-start ${darkMode ? 'text-slate-300 hover:text-white' : ''}`}>
                            {sub.name}
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Sort */}
                  <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                    <CardHeader>
                      <CardTitle className={`text-lg ${darkMode ? 'text-white' : ''}`}>Sort By</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { id: 'newest', label: 'Newest' },
                        { id: 'price-low', label: 'Price: Low to High' },
                        { id: 'price-high', label: 'Price: High to Low' },
                        { id: 'popular', label: 'Most Popular' },
                        { id: 'rating', label: 'Best Rated' },
                      ].map((sort) => (
                        <Button
                          key={sort.id}
                          variant={sortBy === sort.id ? 'default' : 'ghost'}
                          className={`w-full justify-start ${sortBy === sort.id ? 'bg-purple-600 text-white' : darkMode ? 'text-slate-300 hover:text-white' : ''}`}
                          onClick={() => setSortBy(sort.id as any)}
                        >
                          {sort.label}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Active Coupons */}
                  {coupons.length > 0 && (
                    <Card className={`${darkMode ? 'bg-slate-800 border-slate-700' : ''} border-2 border-dashed border-purple-300`}>
                      <CardHeader>
                        <CardTitle className={`text-lg flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
                          <Gift className="w-5 h-5 text-purple-500" />
                          Active Coupons
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {coupons.slice(0, 3).map((coupon) => (
                          <div key={coupon.id} className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-purple-50'}`}>
                            <p className="font-mono font-bold text-purple-600">{coupon.code}</p>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`}
                              {coupon.minPurchase && ` • Min $${coupon.minPurchase}`}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                    Showing {products.length} products
                  </p>
                  <div className="flex gap-2">
                    <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-purple-600' : ''}>
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-purple-600' : ''}>
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className={`aspect-square ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-2xl mb-3`} />
                        <div className={`h-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-3/4 mb-2`} />
                        <div className={`h-4 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded w-1/2`} />
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className={`w-20 h-20 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center mx-auto mb-4`}>
                      <Search className={`w-8 h-8 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                    </div>
                    <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mb-2`}>No products found</h3>
                    <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <motion.div layout className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6' : 'space-y-4'}>
                    {products.map((product, i) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.02 }}
                        whileHover={{ y: -5 }}
                        className={viewMode === 'list' ? `flex gap-4 p-4 ${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-slate-700' : ''} hover:shadow-lg transition-shadow cursor-pointer` : 'group cursor-pointer'}
                        onClick={() => { setSelectedProduct(product); setShowProductModal(true) }}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <div className={`relative aspect-square rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} mb-3`}>
                              <img src={product.images?.[0] || '/api/placeholder/400/400'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              {product.comparePrice && <Badge className="absolute top-3 left-3 bg-red-500 text-white">-{getDiscountPercentage(product.price, product.comparePrice)}%</Badge>}
                              <Badge className={`absolute top-3 right-3 ${darkMode ? 'bg-slate-700 text-slate-300' : ''}`} variant="secondary">{product.condition}</Badge>
                              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <Button size="icon" className="rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg" onClick={(e) => { e.stopPropagation(); toggleWishlist(product) }}>
                                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                </Button>
                                <Button size="icon" className="rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" onClick={(e) => { e.stopPropagation(); addItem(product); toast.success('Added to cart!') }}>
                                  <ShoppingCart className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-1`}>{product.brand}</p>
                              <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'} line-clamp-1`}>{product.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-lg text-purple-600">${product.price.toFixed(2)}</span>
                                {product.comparePrice && <span className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'} line-through`}>${product.comparePrice.toFixed(2)}</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                                  ))}
                                </div>
                                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>({product.reviewCount})</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                              <img src={product.images?.[0] || '/api/placeholder/400/400'} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.brand}</p>
                                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</h3>
                                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} line-clamp-1 mt-1`}>{product.description}</p>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-lg text-purple-600">${product.price.toFixed(2)}</span>
                                  {product.comparePrice && <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'} line-through`}>${product.comparePrice.toFixed(2)}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className={`text-xs capitalize ${darkMode ? 'border-slate-600' : ''}`}>{product.category}</Badge>
                                <Badge className={conditionColors[product.condition] || ''}>{product.condition}</Badge>
                                <div className="flex items-center gap-1 ml-auto">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.rating.toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* WISHLIST VIEW */}
          {currentView === 'wishlist' && user?.role === 'BUYER' && (
            <motion.div key="wishlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Heart className="w-6 h-6 inline mr-2 text-pink-500" />
                  My Wishlist ({getWishlistCount()})
                </h2>
              </div>
              
              {wishlistItems.length === 0 ? (
                <Card className={`text-center py-12 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <CardContent>
                    <Heart className={`w-12 h-12 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mb-2`}>Your wishlist is empty</h4>
                    <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>Save items you love by clicking the heart icon</p>
                    <Button onClick={() => setCurrentView('shop')}>Browse Products</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {wishlistItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl overflow-hidden shadow-lg`}
                    >
                      <div className="relative aspect-square">
                        <img src={item.product?.images?.[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 rounded-full bg-white/80 hover:bg-white"
                          onClick={() => removeFromWishlist(item.productId)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="p-4">
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'} line-clamp-1`}>{item.product?.name}</h4>
                        <p className="font-bold text-purple-600">${item.product?.price.toFixed(2)}</p>
                        <Button className="w-full mt-2 bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => { if(item.product) { addItem(item.product); toast.success('Added to cart!') } }}>
                          <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* SELLER DASHBOARD VIEW */}
          {currentView === 'seller' && user?.role === 'SELLER' && (
            <motion.div key="seller" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Package, label: 'Products', value: sellerProducts.length, color: 'from-blue-500 to-cyan-500', change: '+12%' },
                  { icon: ShoppingBag, label: 'Orders', value: sellerOrders.length, color: 'from-purple-500 to-pink-500', change: '+8%' },
                  { icon: DollarSign, label: 'Earnings', value: `$${(user.balance || 0).toFixed(2)}`, color: 'from-green-500 to-emerald-500', change: '+25%' },
                  { icon: TrendingUp, label: 'Views', value: sellerProducts.reduce((sum, p) => sum + (p.views || 0), 0), color: 'from-orange-500 to-amber-500', change: '+15%' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-5 h-5 text-white" />
                          </div>
                          <Badge className="bg-green-100 text-green-700">{stat.change}</Badge>
                        </div>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>{stat.value}</p>
                        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Store Profile Card */}
              <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                <div className="h-32 bg-gradient-to-r from-violet-600 to-purple-600 rounded-t-lg" />
                <CardContent className="pt-0 relative">
                  <div className="flex items-end gap-4 -mt-12">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-slate-800">
                      {user.storeName?.[0] || user.name[0]}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : ''}`}>{user.storeName || user.name}</h3>
                        {user.isVerified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                      </div>
                      <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{user.storeDesc || 'No description yet'}</p>
                    </div>
                    <div className="flex gap-4 pb-2">
                      <div className="text-center">
                        <p className={`font-bold ${darkMode ? 'text-white' : ''}`}>{followersCount}</p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Followers</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-bold ${darkMode ? 'text-white' : ''}`}>{sellerProducts.length}</p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Products</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="products" className="space-y-6">
                <TabsList className={darkMode ? 'bg-slate-800' : ''}>
                  <TabsTrigger value="products">Products</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="add">Add Product</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : ''}`}>Your Products</h3>
                    <Button onClick={() => document.getElementById('add-product-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      <Plus className="w-4 h-4 mr-2" /> Add Product
                    </Button>
                  </div>
                  
                  {sellerProducts.length === 0 ? (
                    <Card className={`text-center py-12 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <CardContent>
                        <Package className={`w-12 h-12 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mb-2`}>No products yet</h4>
                        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>Add your first product to start selling</p>
                        <Button>Add Your First Product</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {sellerProducts.map((product) => (
                        <Card key={product.id} className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
                              <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</h4>
                              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.category} • {product.condition}</p>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="font-bold text-purple-600">${product.price.toFixed(2)}</span>
                                <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{product.views} views</span>
                                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>{product.status}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
                              <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : ''}`}>Orders to Fulfill</h3>
                  
                  {sellerOrders.length === 0 ? (
                    <Card className={`text-center py-12 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                      <CardContent>
                        <ShoppingBag className={`w-12 h-12 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
                        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mb-2`}>No orders yet</h4>
                        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Orders will appear here when buyers purchase your products</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {sellerOrders.map((order: any) => (
                        <Card key={order.id} className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>Order #{order.orderNumber || order.id.slice(-8)}</p>
                                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                              <Badge className={statusColors[order.status] || ''}>{order.status}</Badge>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <span className={darkMode ? 'text-slate-300' : ''}>{item.product?.name || 'Product'} x{item.quantity}</span>
                                  <span className={darkMode ? 'text-white' : ''}>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            
                            {order.buyerPhone && (
                              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-2`}>
                                <Phone className="w-4 h-4 inline mr-1" />{order.buyerPhone}
                              </p>
                            )}
                            
                            <div className="flex gap-2 mt-4">
                              {order.status === 'pending' && (
                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'processing')}>Confirm Order</Button>
                              )}
                              {order.status === 'processing' && (
                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'shipped')}>Mark as Shipped</Button>
                              )}
                              {order.status === 'shipped' && (
                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>Mark as Delivered</Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                      <CardHeader>
                        <CardTitle className={darkMode ? 'text-white' : ''}>Sales Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center text-slate-400">
                          <BarChart3 className="w-32 h-32 opacity-30" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                      <CardHeader>
                        <CardTitle className={darkMode ? 'text-white' : ''}>Top Products</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {sellerProducts.slice(0, 5).map((p, i) => (
                          <div key={p.id} className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center text-sm font-medium`}>{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${darkMode ? 'text-white' : ''}`}>{p.name}</p>
                              <p className="text-xs text-slate-500">{p.soldCount || 0} sold</p>
                            </div>
                            <span className="font-medium text-purple-600">${p.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="add" id="add-product-section">
                  <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                    <CardHeader>
                      <CardTitle className={darkMode ? 'text-white' : ''}>Add New Product</CardTitle>
                      <CardDescription>List a new item for sale</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddProduct} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className={darkMode ? 'text-white' : ''}>Product Name *</Label>
                            <Input value={productForm.name} onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Nike Air Max 270" required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                          </div>
                          <div>
                            <Label className={darkMode ? 'text-white' : ''}>Brand</Label>
                            <Input value={productForm.brand} onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))} placeholder="e.g., Nike" className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                          </div>
                        </div>
                        
                        <div>
                          <Label className={darkMode ? 'text-white' : ''}>Description *</Label>
                          <Textarea value={productForm.description} onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe your product..." rows={4} required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <Label className={darkMode ? 'text-white' : ''}>Price ($) *</Label>
                            <Input type="number" step="0.01" value={productForm.price} onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))} placeholder="0.00" required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                          </div>
                          <div>
                            <Label className={darkMode ? 'text-white' : ''}>Compare at Price ($)</Label>
                            <Input type="number" step="0.01" value={productForm.comparePrice} onChange={(e) => setProductForm(prev => ({ ...prev, comparePrice: e.target.value }))} placeholder="0.00" className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                          </div>
                          <div>
                            <Label className={darkMode ? 'text-white' : ''}>Stock *</Label>
                            <Input type="number" value={productForm.stock} onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))} placeholder="1" required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className={darkMode ? 'text-white' : ''}>Category *</Label>
                            <Select value={productForm.category} onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger className={darkMode ? 'bg-slate-700 border-slate-600' : ''}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="shoes">👟 Shoes</SelectItem>
                                <SelectItem value="clothes">👕 Clothing</SelectItem>
                                <SelectItem value="accessories">👜 Accessories</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className={darkMode ? 'text-white' : ''}>Condition *</Label>
                            <Select value={productForm.condition} onValueChange={(value) => setProductForm(prev => ({ ...prev, condition: value }))}>
                              <SelectTrigger className={darkMode ? 'bg-slate-700 border-slate-600' : ''}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="like-new">Like New</SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="fair">Fair</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label className={darkMode ? 'text-white' : ''}>Image URL</Label>
                          <Input value={productForm.images[0] || ''} onChange={(e) => setProductForm(prev => ({ ...prev, images: e.target.value ? [e.target.value] : [] }))} placeholder="https://example.com/image.jpg" className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Use Unsplash URLs for best results</p>
                        </div>
                        
                        <div>
                          <Label className={darkMode ? 'text-white' : ''}>Tags (comma separated)</Label>
                          <Input value={productForm.tags} onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))} placeholder="trending, popular, new" className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                        </div>
                        
                        <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
                          <Save className="w-4 h-4 mr-2" /> List Product
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}

          {/* ORDERS VIEW */}
          {currentView === 'orders' && user?.role === 'BUYER' && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Package className="w-6 h-6 inline mr-2 text-purple-500" />
                My Orders
              </h2>
              
              {orders.length === 0 ? (
                <Card className={`text-center py-12 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <CardContent>
                    <Package className={`w-12 h-12 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mb-2`}>No orders yet</h4>
                    <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} mb-4`}>Start shopping to see your orders here</p>
                    <Button onClick={() => setCurrentView('shop')}>Browse Products</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <Card key={order.id} className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>Order #{order.orderNumber || order.id.slice(-8)}</p>
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={statusColors[order.status] || ''}>{order.status}</Badge>
                            <p className={`font-bold mt-1 ${darkMode ? 'text-white' : ''}`}>${order.totalAmount?.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                              <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden">
                                <img src={item.product?.images?.[0] || '/api/placeholder/100/100'} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>{item.product?.name}</p>
                                <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Qty: {item.quantity}</p>
                              </div>
                              <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>

                        {order.loyaltyEarned > 0 && (
                          <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-purple-50'}`}>
                            <p className="text-sm text-purple-600">⭐ You earned {order.loyaltyEarned} loyalty points!</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* BLOG VIEW */}
          {currentView === 'blog' && (
            <motion.div key="blog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="text-center">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>StyleHub Blog</h2>
                <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Fashion tips, trends, and inspiration</p>
              </div>
              
              {blogs.length === 0 ? (
                <Card className={`text-center py-12 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <CardContent>
                    <BookOpen className={`w-12 h-12 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
                    <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'} mb-2`}>No blog posts yet</h4>
                    <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Check back soon for fashion tips and articles!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog, i) => (
                    <motion.article
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`${darkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group`}
                    >
                      <div className={`aspect-video ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} overflow-hidden`}>
                        <img src={blog.coverImage || '/api/placeholder/400/200'} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className={darkMode ? 'border-slate-600' : ''}>{blog.category}</Badge>
                          <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{blog.views} views</span>
                        </div>
                        <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-slate-900'} mb-2 group-hover:text-purple-600 transition-colors`}>{blog.title}</h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'} line-clamp-2`}>{blog.excerpt}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                            {blog.author?.name?.[0] || 'A'}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${darkMode ? 'text-white' : ''}`}>{blog.author?.name || 'Admin'}</p>
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Draft'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ADMIN VIEW */}
          {currentView === 'admin' && user?.role === 'ADMIN' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Settings className="w-6 h-6 inline mr-2" />
                Admin Dashboard
              </h2>
              
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Package, label: 'Total Products', value: stats.totalProducts, color: 'from-blue-500 to-cyan-500' },
                  { icon: ShoppingBag, label: 'Total Sales', value: stats.totalSales, color: 'from-green-500 to-emerald-500' },
                  { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'from-purple-500 to-pink-500' },
                  { icon: DollarSign, label: 'Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'from-orange-500 to-amber-500' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                      <CardContent className="p-6">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>{stat.value}</p>
                        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Tabs defaultValue="users">
                <TabsList className={darkMode ? 'bg-slate-800' : ''}>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="coupons">Coupons</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="mt-6">
                  <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                    <CardHeader>
                      <CardTitle className={darkMode ? 'text-white' : ''}>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <th className={`text-left py-3 ${darkMode ? 'text-slate-300' : ''}`}>Name</th>
                              <th className={`text-left py-3 ${darkMode ? 'text-slate-300' : ''}`}>Email</th>
                              <th className={`text-left py-3 ${darkMode ? 'text-slate-300' : ''}`}>Role</th>
                              <th className={`text-right py-3 ${darkMode ? 'text-slate-300' : ''}`}>Balance</th>
                              <th className={`text-right py-3 ${darkMode ? 'text-slate-300' : ''}`}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allUsers.map((u) => (
                              <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700">
                                <td className={`py-3 ${darkMode ? 'text-white' : ''}`}>{u.name}</td>
                                <td className={`py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{u.email}</td>
                                <td className="py-3"><Badge variant="outline" className={darkMode ? 'border-slate-600' : ''}>{u.role}</Badge></td>
                                <td className={`py-3 text-right ${darkMode ? 'text-white' : ''}`}>${(u.balance || 0).toFixed(2)}</td>
                                <td className="py-3 text-right">
                                  {u.isVerified ? <Badge className="bg-green-100 text-green-700">Verified</Badge> : <Badge variant="secondary">Pending</Badge>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="coupons" className="mt-6">
                  <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                    <CardHeader>
                      <CardTitle className={darkMode ? 'text-white' : ''}>Active Coupons</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {coupons.length === 0 ? (
                        <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>No active coupons</p>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {coupons.map((coupon) => (
                            <div key={coupon.id} className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-purple-50'} border-2 border-dashed border-purple-300`}>
                              <p className="font-mono font-bold text-xl text-purple-600">{coupon.code}</p>
                              <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{coupon.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge>{coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`}</Badge>
                                <Badge variant="outline" className={darkMode ? 'border-slate-600' : ''}>Used: {coupon.usedCount}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                  <Card className={darkMode ? 'bg-slate-800 border-slate-700' : ''}>
                    <CardHeader>
                      <CardTitle className={darkMode ? 'text-white' : ''}>Platform Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className={darkMode ? 'text-white' : ''}>Commission Rate (%)</Label>
                          <Input
                            type="number"
                            value={(settings.commissionRate * 100).toFixed(0)}
                            onChange={(e) => setSettings(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) / 100 }))}
                            className={darkMode ? 'bg-slate-700 border-slate-600' : ''}
                          />
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Sellers keep {((1 - settings.commissionRate) * 100).toFixed(0)}% of each sale</p>
                        </div>
                        <div>
                          <Label className={darkMode ? 'text-white' : ''}>Platform Name</Label>
                          <Input value={settings.platformName} onChange={(e) => setSettings(prev => ({ ...prev, platformName: e.target.value }))} className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Login/Register Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className={`sm:max-w-md ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={`text-2xl ${darkMode ? 'text-white' : ''}`}>Welcome to StyleHub</DialogTitle>
            <DialogDescription>Sign in to shop or start selling today</DialogDescription>
          </DialogHeader>
          
          <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label className={darkMode ? 'text-white' : ''}>Email</Label>
                  <Input type="email" value={authForm.email} onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))} placeholder="your@email.com" required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                </div>
                <div>
                  <Label className={darkMode ? 'text-white' : ''}>Password</Label>
                  <Input type="password" value={authForm.password} onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-purple-600">Sign In</Button>
                <p className={`text-xs text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Demo: admin@stylehub.com / admin123
                </p>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label className={darkMode ? 'text-white' : ''}>Full Name</Label>
                  <Input value={authForm.name} onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))} placeholder="John Doe" required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                </div>
                <div>
                  <Label className={darkMode ? 'text-white' : ''}>Email</Label>
                  <Input type="email" value={authForm.email} onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))} placeholder="your@email.com" required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                </div>
                <div>
                  <Label className={darkMode ? 'text-white' : ''}>Password</Label>
                  <Input type="password" value={authForm.password} onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                </div>
                <div>
                  <Label className={darkMode ? 'text-white' : ''}>I want to</Label>
                  <Select value={authForm.role} onValueChange={(value) => setAuthForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className={darkMode ? 'bg-slate-700 border-slate-600' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUYER">🛍️ Buy Products</SelectItem>
                      <SelectItem value="SELLER">🏪 Sell Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {authForm.role === 'SELLER' && (
                  <>
                    <div>
                      <Label className={darkMode ? 'text-white' : ''}>Store Name</Label>
                      <Input value={authForm.storeName} onChange={(e) => setAuthForm(prev => ({ ...prev, storeName: e.target.value }))} placeholder="My Awesome Store" required className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                    </div>
                    <div>
                      <Label className={darkMode ? 'text-white' : ''}>Store Description</Label>
                      <Textarea value={authForm.storeDesc} onChange={(e) => setAuthForm(prev => ({ ...prev, storeDesc: e.target.value }))} placeholder="What do you sell?" rows={2} className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                    </div>
                  </>
                )}
                
                <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-purple-600">Create Account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Product Detail Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className={`sm:max-w-4xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className={`aspect-square rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <img src={selectedProduct.images?.[0] || '/api/placeholder/400/400'} alt={selectedProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`aspect-square rounded-lg overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} cursor-pointer hover:ring-2 hover:ring-purple-500`}>
                      <img src={selectedProduct.images?.[0] || '/api/placeholder/100/100'} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{selectedProduct.brand}</p>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>{selectedProduct.name}</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={conditionColors[selectedProduct.condition] || ''}>{selectedProduct.condition}</Badge>
                  <Badge variant="outline" className={`capitalize ${darkMode ? 'border-slate-600' : ''}`}>{selectedProduct.category}</Badge>
                  {selectedProduct.soldCount && selectedProduct.soldCount > 50 && (
                    <Badge className="bg-orange-500 text-white">🔥 Hot Item</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-purple-600">${selectedProduct.price.toFixed(2)}</span>
                  {selectedProduct.comparePrice && (
                    <>
                      <span className={`text-lg ${darkMode ? 'text-slate-500' : 'text-slate-400'} line-through`}>${selectedProduct.comparePrice.toFixed(2)}</span>
                      <Badge className="bg-red-500 text-white">-{getDiscountPercentage(selectedProduct.price, selectedProduct.comparePrice)}%</Badge>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                    ))}
                  </div>
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>({selectedProduct.reviewCount} reviews)</span>
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>•</span>
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{selectedProduct.soldCount} sold</span>
                </div>
                
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{selectedProduct.description}</p>
                
                <Separator className={darkMode ? 'bg-slate-700' : ''} />
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white font-medium">
                    {selectedProduct.seller?.storeName?.[0] || selectedProduct.seller?.name?.[0] || 'S'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>{selectedProduct.seller?.storeName || selectedProduct.seller?.name}</p>
                      {selectedProduct.seller?.isVerified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Seller</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toggleFollow(selectedProduct.sellerId)}>
                    <Users className="w-4 h-4 mr-1" /> Follow
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Eye className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{selectedProduct.views} views</span>
                  {selectedProduct.stock < 5 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">Only {selectedProduct.stock} left!</Badge>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600" onClick={() => { addItem(selectedProduct); toast.success('Added to cart!') }}>
                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                  </Button>
                  <Button variant="outline" size="icon" className={darkMode ? 'border-slate-600' : ''} onClick={() => toggleWishlist(selectedProduct)}>
                    <Heart className={`w-4 h-4 ${isInWishlist(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" className={darkMode ? 'border-slate-600' : ''}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Sidebar */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className={`sm:max-w-lg ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${darkMode ? 'text-white' : ''}`}>
              <ShoppingCart className="w-5 h-5" />
              Your Cart ({getItemCount()} items)
            </DialogTitle>
          </DialogHeader>
          
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className={`w-12 h-12 ${darkMode ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
              <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              <ScrollArea className="max-h-[300px]">
                {items.map((item) => (
                  <div key={item.product.id} className={`flex gap-3 py-3 border-b ${darkMode ? 'border-slate-700' : ''}`}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                      <img src={item.product.images?.[0] || '/api/placeholder/100/100'} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm line-clamp-1 ${darkMode ? 'text-white' : ''}`}>{item.product.name}</h4>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>${item.product.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button variant="outline" size="icon" className="w-6 h-6" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className={`text-sm ${darkMode ? 'text-white' : ''}`}>{item.quantity}</span>
                        <Button variant="outline" size="icon" className="w-6 h-6" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${darkMode ? 'text-white' : ''}`}>${(item.product.price * item.quantity).toFixed(2)}</p>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeItem(item.product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
              
              {/* Coupon */}
              <div className="flex gap-2">
                <Input placeholder="Coupon code" value={checkoutForm.couponCode} onChange={(e) => setCheckoutForm(prev => ({ ...prev, couponCode: e.target.value }))} className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                <Button variant="outline" onClick={handleApplyCoupon}>Apply</Button>
              </div>
              
              {appliedCoupon && (
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-purple-500" />
                    <span className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>{appliedCoupon.code}</span>
                  </div>
                  <span className="font-medium text-green-600">-${getDiscount().toFixed(2)}</span>
                </div>
              )}
              
              <div className={`border-t pt-4 space-y-4 ${darkMode ? 'border-slate-700' : ''}`}>
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Subtotal</span>
                  <span className={darkMode ? 'text-white' : ''}>${getSubtotal().toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${getDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span className={darkMode ? 'text-white' : ''}>Total</span>
                  <span className="text-purple-600">${getTotal().toFixed(2)}</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className={darkMode ? 'text-white' : ''}>Delivery Address *</Label>
                    <Textarea value={checkoutForm.shippingAddress} onChange={(e) => setCheckoutForm(prev => ({ ...prev, shippingAddress: e.target.value }))} placeholder="Enter your full address..." rows={2} className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                  </div>
                  <div>
                    <Label className={darkMode ? 'text-white' : ''}>Phone Number *</Label>
                    <Input value={checkoutForm.buyerPhone} onChange={(e) => setCheckoutForm(prev => ({ ...prev, buyerPhone: e.target.value }))} placeholder="+1 234 567 890" className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                  </div>
                  <div>
                    <Label className={darkMode ? 'text-white' : ''}>Order Notes</Label>
                    <Input value={checkoutForm.notes} onChange={(e) => setCheckoutForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="Any special instructions..." className={darkMode ? 'bg-slate-700 border-slate-600' : ''} />
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600" onClick={handleCheckout}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Place Order (Cash on Delivery)
                </Button>
                
                {user && (
                  <p className={`text-xs text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    ⭐ You'll earn {Math.floor(getTotal() * 10)} loyalty points with this order!
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-slate-900' : 'bg-slate-900'} text-white mt-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">StyleHub</span>
              </div>
              <p className="text-slate-400">
                Your premium fashion marketplace. Discover unique styles from trusted sellers worldwide.
              </p>
              <div className="flex gap-4 mt-4">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <Youtube className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer">Shoes</li>
                <li className="hover:text-white cursor-pointer">Clothing</li>
                <li className="hover:text-white cursor-pointer">Accessories</li>
                <li className="hover:text-white cursor-pointer">New Arrivals</li>
                <li className="hover:text-white cursor-pointer">Flash Sales</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer">Help Center</li>
                <li className="hover:text-white cursor-pointer">Buyer Protection</li>
                <li className="hover:text-white cursor-pointer">Returns & Refunds</li>
                <li className="hover:text-white cursor-pointer">Contact Us</li>
                <li className="hover:text-white cursor-pointer">FAQ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Sell on StyleHub</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-white cursor-pointer">Start Selling</li>
                <li className="hover:text-white cursor-pointer">Seller Guidelines</li>
                <li className="hover:text-white cursor-pointer">Fees & Pricing</li>
                <li className="hover:text-white cursor-pointer">Success Stories</li>
                <li className="hover:text-white cursor-pointer">Seller Dashboard</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© {new Date().getFullYear()} StyleHub. All rights reserved.</p>
            <div className="flex gap-6 text-slate-400 text-sm">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span className="hover:text-white cursor-pointer">Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
