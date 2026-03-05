import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple hash function for passwords
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const sampleProducts = [
  // Shoes - Sneakers
  { name: 'Nike Air Max 270 React', description: 'Premium running sneakers with revolutionary air cushion technology and React foam for unmatched comfort. Perfect for daily wear, athletic activities, and casual outings. Features breathable mesh upper and iconic Air Max styling.', price: 179.99, comparePrice: 220.00, category: 'shoes', subCategory: 'sneakers', brand: 'Nike', condition: 'new', stock: 25, featured: true, tags: ['running', 'comfortable', 'trending'], isNew: true, isTrending: true },
  { name: 'Adidas Ultraboost 22', description: 'High-performance running shoes with Boost technology for maximum energy return. Primeknit upper adapts to your foot for a sock-like fit. Continental rubber outsole for superior grip in all conditions.', price: 189.99, comparePrice: 250.00, category: 'shoes', subCategory: 'sneakers', brand: 'Adidas', condition: 'new', stock: 18, featured: true, tags: ['running', 'sports', 'premium'] },
  { name: 'Jordan 1 Retro High OG', description: 'Iconic basketball sneaker that started it all. Premium leather upper with classic color blocking. Air-Sole unit for lightweight cushioning. A must-have for sneaker collectors.', price: 179.99, category: 'shoes', subCategory: 'sneakers', brand: 'Jordan', condition: 'new', stock: 8, featured: true, isBestSeller: true, tags: ['basketball', 'iconic', 'limited'] },
  { name: 'New Balance 990v5', description: 'American-made premium running shoe. ENCAP midsole technology provides support and durability. Pigskin leather and mesh upper for premium feel.', price: 174.99, comparePrice: 200.00, category: 'shoes', subCategory: 'sneakers', brand: 'New Balance', condition: 'new', stock: 22, tags: ['made-in-usa', 'premium', 'running'] },
  { name: 'Converse Chuck Taylor All Star', description: 'Timeless canvas high-top sneaker. OrthoLite insole for comfort. Vulcanized rubber sole. A wardrobe essential for over 100 years.', price: 59.99, comparePrice: 75.00, category: 'shoes', subCategory: 'casual', brand: 'Converse', condition: 'new', stock: 50, isBestSeller: true, tags: ['classic', 'casual', 'versatile'] },
  
  // Shoes - Formal
  { name: 'Oxford Leather Dress Shoes', description: 'Handcrafted Italian leather oxford shoes. Goodyear welt construction for durability and resoleability. Perfect for formal occasions and business wear.', price: 249.99, comparePrice: 350.00, category: 'shoes', subCategory: 'formal', brand: 'Allen Edmonds', condition: 'new', stock: 12, tags: ['formal', 'leather', 'handmade'] },
  { name: 'Classic Loafer Penny', description: 'Timeless penny loafer in premium calfskin leather. Cushioned insole for all-day comfort. Versatile style that works for both casual and semi-formal occasions.', price: 159.99, category: 'shoes', subCategory: 'formal', brand: 'Cole Haan', condition: 'new', stock: 18, tags: ['versatile', 'comfortable', 'classic'] },
  
  // Shoes - Boots
  { name: 'Dr. Martens 1460 8-Eye Boot', description: 'The original Dr. Martens boot. Durable leather upper with signature air-cushioned sole. Goodyear welt construction. An icon of rebellious self-expression.', price: 149.99, category: 'shoes', subCategory: 'boots', brand: 'Dr. Martens', condition: 'new', stock: 30, featured: true, isBestSeller: true, tags: ['iconic', 'durable', 'punk'] },
  { name: 'Timberland 6-Inch Premium Boot', description: 'Waterproof leather boot with sealed seams. Anti-fatigue technology for all-day comfort. Padded collar for ankle support. A streetwear classic.', price: 189.99, comparePrice: 220.00, category: 'shoes', subCategory: 'boots', brand: 'Timberland', condition: 'new', stock: 20, tags: ['waterproof', 'outdoor', 'streetwear'] },
  { name: 'Chelsea Ankle Boots', description: 'Sleek Chelsea boots in premium suede. Elastic side panels for easy on-off. Leather lined for comfort. Perfect for smart casual looks.', price: 129.99, category: 'shoes', subCategory: 'boots', brand: 'Clarks', condition: 'new', stock: 15, tags: ['sleek', 'versatile', 'comfortable'] },
  
  // Shoes - Heels
  { name: 'Stiletto High Heels', description: 'Elegant 4-inch stiletto heels in genuine leather. Padded insole for comfort. Perfect for special occasions and evening events.', price: 129.99, comparePrice: 180.00, category: 'shoes', subCategory: 'heels', brand: 'Steve Madden', condition: 'new', stock: 20, tags: ['elegant', 'evening', 'premium'] },
  { name: 'Block Heel Sandals', description: 'Comfortable block heel sandals with adjustable straps. Breathable design perfect for summer. Versatile enough for day-to-night wear.', price: 89.99, category: 'shoes', subCategory: 'heels', brand: 'Sam Edelman', condition: 'new', stock: 25, tags: ['summer', 'comfortable', 'versatile'] },
  
  // Clothes - T-Shirts
  { name: 'Premium Cotton Crew Neck Tee', description: '100% organic cotton t-shirt with a relaxed fit. Pre-washed for extra softness. Reinforced shoulder seams. Available in 15 colors.', price: 34.99, comparePrice: 49.99, category: 'clothes', subCategory: 't-shirts', brand: 'Everlane', condition: 'new', stock: 100, tags: ['organic', 'basics', 'essential'] },
  { name: 'Vintage Band Graphic Tee', description: 'Authentic vintage-washed graphic tee featuring classic rock bands. Soft, broken-in feel from day one. Limited edition designs.', price: 44.99, category: 'clothes', subCategory: 't-shirts', brand: 'Bravado', condition: 'new', stock: 35, tags: ['vintage', 'graphic', 'limited'] },
  { name: 'Performance Athletic Shirt', description: 'Moisture-wicking athletic shirt with 4-way stretch. Anti-odor technology. Reflective details for visibility. Perfect for intense workouts.', price: 49.99, category: 'clothes', subCategory: 't-shirts', brand: 'Under Armour', condition: 'new', stock: 60, tags: ['athletic', 'performance', 'sports'] },
  
  // Clothes - Jeans
  { name: 'Slim Fit Stretch Jeans', description: 'Modern slim fit jeans with added stretch for comfort. Classic 5-pocket styling. Sustainable denim production. The perfect everyday jean.', price: 89.99, comparePrice: 120.00, category: 'clothes', subCategory: 'jeans', brand: "Levi's", condition: 'new', stock: 80, featured: true, isBestSeller: true, tags: ['classic', 'everyday', 'comfortable'] },
  { name: 'Raw Selvedge Denim', description: 'Japanese selvedge denim in a straight fit. Unwashed for custom fading. Chainstitch hem. For the true denim enthusiast.', price: 198.99, category: 'clothes', subCategory: 'jeans', brand: 'Nudie Jeans', condition: 'new', stock: 20, tags: ['selvedge', 'premium', 'japanese'] },
  { name: 'High-Rise Mom Jeans', description: 'Vintage-inspired high-rise jeans with a relaxed leg. Non-stretch denim for authentic look. Cropped length perfect for ankle boots.', price: 79.99, category: 'clothes', subCategory: 'jeans', brand: 'Madewell', condition: 'new', stock: 45, tags: ['vintage', 'trending', 'womens'] },
  
  // Clothes - Jackets
  { name: 'Classic Leather Biker Jacket', description: 'Genuine leather motorcycle jacket with asymmetric zip. Quilted lining. Multiple pockets. A timeless investment piece that only gets better with age.', price: 349.99, comparePrice: 450.00, category: 'clothes', subCategory: 'jackets', brand: 'Schott NYC', condition: 'new', stock: 10, featured: true, tags: ['leather', 'iconic', 'investment'] },
  { name: 'Denim Trucker Jacket', description: 'Classic denim trucker jacket with button front. Two chest pockets. Timeless style that pairs with everything. Available in multiple washes.', price: 79.99, category: 'clothes', subCategory: 'jackets', brand: "Levi's", condition: 'new', stock: 40, tags: ['classic', 'versatile', 'timeless'] },
  { name: 'Packable Down Puffer', description: 'Ultra-lightweight down jacket that packs into its own pocket. 650-fill power down for exceptional warmth. Water-resistant shell.', price: 149.99, comparePrice: 200.00, category: 'clothes', subCategory: 'jackets', brand: 'Uniqlo', condition: 'new', stock: 55, tags: ['warm', 'packable', 'practical'] },
  
  // Clothes - Dresses
  { name: 'Floral Maxi Dress', description: 'Flowing floral print maxi dress with adjustable straps. V-neckline with smocked back. Perfect for summer days and beach vacations.', price: 89.99, comparePrice: 120.00, category: 'clothes', subCategory: 'dresses', brand: 'Reformation', condition: 'new', stock: 30, tags: ['summer', 'floral', 'boho'] },
  { name: 'Little Black Dress', description: 'Essential LBD in a figure-flattering silhouette. Knee-length with 3/4 sleeves. Transitions seamlessly from office to evening.', price: 129.99, category: 'clothes', subCategory: 'dresses', brand: 'Ted Baker', condition: 'new', stock: 25, featured: true, tags: ['classic', 'versatile', 'elegant'] },
  { name: 'Silk Evening Gown', description: 'Luxurious 100% silk evening gown with elegant draping. Floor-length with subtle train. Perfect for galas and black-tie events.', price: 449.99, comparePrice: 600.00, category: 'clothes', subCategory: 'dresses', brand: 'Needle & Thread', condition: 'new', stock: 8, tags: ['luxury', 'evening', 'silk'] },
  
  // Clothes - Hoodies
  { name: 'Essential Pullover Hoodie', description: 'Heavyweight cotton-blend hoodie with kangaroo pocket. Ribbed cuffs and hem. Pre-shrunk for consistent sizing. Your new favorite hoodie.', price: 64.99, category: 'clothes', subCategory: 'hoodies', brand: 'Champion', condition: 'new', stock: 70, tags: ['comfortable', 'everyday', 'basics'] },
  { name: 'Oversized Logo Hoodie', description: 'Trendy oversized hoodie with bold logo graphic. Drop shoulders for relaxed fit. Perfect for streetwear looks.', price: 89.99, category: 'clothes', subCategory: 'hoodies', brand: 'Essentials', condition: 'new', stock: 45, tags: ['oversized', 'streetwear', 'trending'] },
  
  // Clothes - Shorts
  { name: 'Chino Shorts', description: 'Classic chino shorts in stretch cotton. 7-inch inseam. Clean, tailored look. Perfect for warm weather and casual Fridays.', price: 49.99, category: 'clothes', subCategory: 'shorts', brand: 'J.Crew', condition: 'new', stock: 60, tags: ['classic', 'summer', 'versatile'] },
  { name: 'Running Shorts', description: 'Lightweight running shorts with built-in liner. Moisture-wicking fabric. Zip pocket for essentials. Reflective details.', price: 44.99, category: 'clothes', subCategory: 'shorts', brand: 'Nike', condition: 'new', stock: 55, tags: ['athletic', 'running', 'performance'] },
  
  // Clothes - Sweaters
  { name: 'Cashmere Crew Sweater', description: '100% Grade-A cashmere sweater in a classic crew neck. Ribbed trim. Incredibly soft and warm. An investment in comfort.', price: 199.99, comparePrice: 280.00, category: 'clothes', subCategory: 'sweaters', brand: 'Naadam', condition: 'new', stock: 25, tags: ['cashmere', 'luxury', 'soft'] },
  { name: 'Cable Knit Cardigan', description: 'Traditional cable knit cardigan in pure wool. Button front with patch pockets. Timeless style for layering.', price: 119.99, category: 'clothes', subCategory: 'sweaters', brand: 'L.L.Bean', condition: 'new', stock: 30, tags: ['classic', 'wool', 'layering'] },
  
  // Accessories - Bags
  { name: 'Classic Leather Tote Bag', description: 'Spacious leather tote with interior pockets. Fits 15" laptop. Durable construction. The perfect everyday work bag.', price: 159.99, comparePrice: 200.00, category: 'accessories', subCategory: 'bags', brand: 'Cuyana', condition: 'new', stock: 30, featured: true, tags: ['leather', 'work', 'everyday'] },
  { name: 'Canvas Backpack', description: 'Durable canvas backpack with laptop compartment. Padded straps for comfort. Multiple pockets for organization. Perfect for work and travel.', price: 79.99, category: 'accessories', subCategory: 'bags', brand: 'Fjällräven', condition: 'new', stock: 40, tags: ['travel', 'durable', 'practical'] },
  { name: 'Crossbody Messenger Bag', description: 'Compact crossbody bag with adjustable strap. Multiple compartments. Water-resistant fabric. Great for commuting and travel.', price: 59.99, category: 'accessories', subCategory: 'bags', brand: 'Timbuk2', condition: 'new', stock: 35, tags: ['compact', 'waterproof', 'everyday'] },
  
  // Accessories - Sunglasses
  { name: 'Aviator Sunglasses', description: 'Classic aviator sunglasses with polarized lenses. Gold metal frame. 100% UV protection. A timeless style icon.', price: 154.99, category: 'accessories', subCategory: 'sunglasses', brand: 'Ray-Ban', condition: 'new', stock: 40, featured: true, tags: ['classic', 'polarized', 'iconic'] },
  { name: 'Wayfarer Sunglasses', description: 'The original Wayfarer in black acetate. Polarized lenses. Recognizable worldwide. The definition of cool.', price: 149.99, category: 'accessories', subCategory: 'sunglasses', brand: 'Ray-Ban', condition: 'new', stock: 35, tags: ['iconic', 'classic', 'polarized'] },
  
  // Accessories - Jewelry
  { name: 'Minimalist Gold Chain Necklace', description: 'Delicate 18k gold-plated chain necklace. Adjustable length. Perfect for layering or solo wear. Hypoallergenic.', price: 49.99, category: 'accessories', subCategory: 'jewelry', brand: 'Mejuri', condition: 'new', stock: 50, tags: ['minimalist', 'gold', 'layering'] },
  { name: 'Silver Cuff Bracelet', description: 'Handmade sterling silver cuff bracelet. Adjustable fit. Unisex design. Makes a subtle statement.', price: 79.99, category: 'accessories', subCategory: 'jewelry', brand: 'Gorjana', condition: 'new', stock: 30, tags: ['silver', 'handmade', 'unisex'] },
  { name: 'Diamond Stud Earrings', description: 'Classic diamond stud earrings in 14k white gold. 0.25ct total weight. Secure screw-back closure. Timeless elegance.', price: 299.99, category: 'accessories', subCategory: 'jewelry', brand: 'Blue Nile', condition: 'new', stock: 15, tags: ['diamond', 'luxury', 'classic'] },
  
  // Accessories - Watches
  { name: 'Classic Leather Watch', description: 'Swiss-made automatic watch with leather strap. Sapphire crystal. 42mm case. Classic dress watch for any occasion.', price: 249.99, comparePrice: 350.00, category: 'accessories', subCategory: 'watches', brand: 'Tissot', condition: 'new', stock: 15, tags: ['swiss', 'automatic', 'classic'] },
  { name: 'Sport Digital Watch', description: 'Rugged digital watch with multiple functions. Water-resistant to 100m. Stopwatch, alarm, and timer. Built for adventure.', price: 69.99, category: 'accessories', subCategory: 'watches', brand: 'Casio G-Shock', condition: 'new', stock: 45, tags: ['sport', 'waterproof', 'durable'] },
  
  // Accessories - Belts
  { name: 'Reversible Leather Belt', description: 'Premium leather belt reversible between black and brown. Brushed metal buckle. One belt, two looks. Great value.', price: 59.99, category: 'accessories', subCategory: 'belts', brand: 'Boss', condition: 'new', stock: 40, tags: ['reversible', 'leather', 'versatile'] },
  { name: 'Canvas Web Belt', description: 'Casual canvas belt with metal buckle. Fully adjustable. Perfect for jeans and casual wear.', price: 24.99, category: 'accessories', subCategory: 'belts', brand: 'Dickies', condition: 'new', stock: 60, tags: ['casual', 'adjustable', 'everyday'] },
  
  // Accessories - Hats
  { name: 'Classic Fedora Hat', description: 'Wool felt fedora with silk band. Breathable design. Timeless style for the modern gentleman.', price: 79.99, category: 'accessories', subCategory: 'hats', brand: 'Brixton', condition: 'new', stock: 25, tags: ['classic', 'wool', 'stylish'] },
  { name: 'Baseball Cap', description: 'Classic cotton twill cap with adjustable strap. Embroidered logo. Curved brim. One size fits all.', price: 29.99, category: 'accessories', subCategory: 'hats', brand: 'New Era', condition: 'new', stock: 80, tags: ['casual', 'classic', 'everyday'] },
  { name: 'Beanie Hat', description: 'Soft knit beanie in merino wool. Folds up or down for adjustable fit. Perfect for cold weather.', price: 34.99, category: 'accessories', subCategory: 'hats', brand: 'Carhartt', condition: 'new', stock: 50, tags: ['winter', 'wool', 'warm'] },
]

const blogPosts = [
  {
    title: '10 Essential Items Every Wardrobe Needs',
    slug: '10-essential-items-every-wardrobe-needs',
    excerpt: 'Build a timeless wardrobe with these must-have pieces that never go out of style.',
    content: `<p>Building a versatile wardrobe doesn't have to be complicated. Here are 10 essential items that form the foundation of any great wardrobe:</p>
    <h2>1. The Perfect White T-Shirt</h2>
    <p>A crisp white t-shirt is the ultimate versatile piece. Dress it up with a blazer or down with jeans.</p>
    <h2>2. Classic Blue Jeans</h2>
    <p>A well-fitted pair of blue jeans is non-negotiable. Look for a timeless straight or slim fit.</p>
    <h2>3. Little Black Dress</h2>
    <p>For women, an LBD is essential for any occasion from work to evening events.</p>
    <h2>4. Quality Leather Jacket</h2>
    <p>An investment piece that only gets better with age. Choose classic black or brown.</p>
    <h2>5. White Sneakers</h2>
    <p>Comfortable and stylish, white sneakers work with everything from dresses to suits.</p>`,
    category: 'Style Tips',
    tags: ['wardrobe', 'essentials', 'fashion'],
    status: 'published'
  },
  {
    title: 'How to Start Your Online Fashion Store',
    slug: 'how-to-start-your-online-fashion-store',
    excerpt: 'A complete guide to launching your own fashion e-commerce business from scratch.',
    content: `<p>Starting an online fashion store has never been easier. Here's your step-by-step guide:</p>
    <h2>1. Find Your Niche</h2>
    <p>Don't try to sell everything. Focus on a specific category or style to stand out.</p>
    <h2>2. Source Your Products</h2>
    <p>Whether you're making products yourself or working with suppliers, quality is key.</p>
    <h2>3. Build Your Brand</h2>
    <p>Create a memorable brand identity including logo, colors, and voice.</p>
    <h2>4. Set Up Your Store</h2>
    <p>Use platforms like StyleHub to list your products for free and reach customers.</p>`,
    category: 'Business',
    tags: ['entrepreneur', 'selling', 'business'],
    status: 'published'
  },
  {
    title: 'Summer 2024 Fashion Trends You Need to Know',
    slug: 'summer-2024-fashion-trends',
    excerpt: 'Discover the hottest trends shaping this summer\'s fashion scene.',
    content: `<p>Summer 2024 brings exciting trends that blend comfort with style:</p>
    <h2>Bold Colors</h2>
    <p>Vibrant hues like electric blue and hot pink are dominating runways and streets.</p>
    <h2>Oversized Silhouettes</h2>
    <p>Relaxed, comfortable fits are in. Think oversized shirts and wide-leg pants.</p>
    <h2>Sustainable Fashion</h2>
    <p>Eco-conscious choices are more popular than ever. Shop secondhand and choose sustainable brands.</p>`,
    category: 'Trends',
    tags: ['summer', 'trends', '2024'],
    status: 'published'
  }
]

const coupons = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minPurchase: 50, description: 'Welcome discount for new customers', startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), isActive: true },
  { code: 'FLASH20', type: 'percentage', value: 20, minPurchase: 100, maxDiscount: 50, description: 'Flash sale - limited time!', startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), isActive: true },
  { code: 'SAVE25', type: 'fixed', value: 25, minPurchase: 150, description: 'Save $25 on orders over $150', startDate: new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), isActive: true },
  { code: 'FREESHIP', type: 'fixed', value: 0, minPurchase: 75, description: 'Free shipping on orders over $75', startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
  { code: 'NEWUSER', type: 'percentage', value: 15, minPurchase: 30, description: '15% off for new users', startDate: new Date(), endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), isActive: true },
]

const helpCategories = [
  { name: 'Getting Started', slug: 'getting-started', icon: '🚀', order: 1 },
  { name: 'Orders & Shipping', slug: 'orders-shipping', icon: '📦', order: 2 },
  { name: 'Payments & Pricing', slug: 'payments-pricing', icon: '💳', order: 3 },
  { name: 'Returns & Refunds', slug: 'returns-refunds', icon: '↩️', order: 4 },
  { name: 'Selling on StyleHub', slug: 'selling', icon: '🏪', order: 5 },
  { name: 'Account & Security', slug: 'account-security', icon: '🔐', order: 6 },
]

const helpArticles = [
  { categoryId: '', title: 'How to Place an Order', slug: 'how-to-place-order', content: 'Learn how to browse products, add to cart, and complete your purchase on StyleHub.', views: 1250, helpful: 89, isFeatured: true },
  { categoryId: '', title: 'Shipping Options Explained', slug: 'shipping-options', content: 'Understand our shipping methods, delivery times, and tracking information.', views: 890, helpful: 67, isFeatured: true },
  { categoryId: '', title: 'Return Policy', slug: 'return-policy', content: 'Everything you need to know about returns, exchanges, and refunds.', views: 2100, helpful: 156, isFeatured: true },
  { categoryId: '', title: 'How to Become a Seller', slug: 'become-seller', content: 'Step-by-step guide to setting up your store and start selling on StyleHub.', views: 560, helpful: 45, isFeatured: true },
  { categoryId: '', title: 'Payment Methods', slug: 'payment-methods', content: 'Learn about all accepted payment methods and how to use them.', views: 720, helpful: 52, isFeatured: false },
]

const brands = [
  { name: 'Nike', slug: 'nike', description: 'Just Do It - World-leading athletic footwear and apparel', isVerified: true, isFeatured: true, productCount: 15 },
  { name: 'Adidas', slug: 'adidas', description: 'Impossible is Nothing - Premium sportswear and sneakers', isVerified: true, isFeatured: true, productCount: 12 },
  { name: "Levi's", slug: 'levis', description: 'Original jeans since 1873', isVerified: true, isFeatured: true, productCount: 8 },
  { name: 'Ray-Ban', slug: 'ray-ban', description: 'Legendary sunglasses since 1937', isVerified: true, isFeatured: true, productCount: 5 },
  { name: 'Dr. Martens', slug: 'dr-martens', description: 'Iconic boots and shoes', isVerified: true, isFeatured: true, productCount: 6 },
  { name: 'Converse', slug: 'converse', description: 'Classic sneakers for every generation', isVerified: true, isFeatured: false, productCount: 4 },
  { name: 'New Balance', slug: 'new-balance', description: 'Performance footwear made in USA', isVerified: true, isFeatured: false, productCount: 3 },
  { name: 'Puma', slug: 'puma', description: 'Forever Faster - Sports and lifestyle brand', isVerified: true, isFeatured: false, productCount: 7 },
]

const banners = [
  { title: 'Summer Sale is Here!', subtitle: 'Up to 50% off on trending styles', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', buttonText: 'Shop Now', link: '/shop', position: 'hero', isActive: true, order: 1 },
  { title: 'Become a Seller', subtitle: 'Start earning from your fashion sense', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', buttonText: 'Start Selling', link: '/seller', position: 'sidebar', isActive: true, order: 1 },
  { title: 'Free Shipping', subtitle: 'On orders over $50', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800', position: 'footer', isActive: true, order: 1 },
]

export async function POST(request: NextRequest) {
  try {
    // Create demo sellers
    const sellers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'fashion@stylehub.com',
          password: simpleHash('demo123'),
          name: 'StyleHub Fashion',
          role: 'SELLER',
          storeName: 'StyleHub Official Store',
          storeDesc: 'Premium fashion items curated for the modern lifestyle',
          storeBanner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
          storeLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
          phone: '+1234567890',
          isVerified: true,
          verifiedAt: new Date(),
          city: 'New York',
          country: 'USA'
        }
      }),
      prisma.user.create({
        data: {
          email: 'sneakers@stylehub.com',
          password: simpleHash('demo123'),
          name: 'Sneaker Paradise',
          role: 'SELLER',
          storeName: 'Sneaker Paradise',
          storeDesc: 'Authentic sneakers from top brands worldwide',
          storeBanner: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200',
          phone: '+1234567891',
          isVerified: true,
          verifiedAt: new Date(),
          city: 'Los Angeles',
          country: 'USA'
        }
      }),
      prisma.user.create({
        data: {
          email: 'luxury@stylehub.com',
          password: simpleHash('demo123'),
          name: 'Luxury Lane',
          role: 'SELLER',
          storeName: 'Luxury Lane',
          storeDesc: 'High-end fashion and accessories',
          storeBanner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
          phone: '+1234567892',
          isVerified: true,
          verifiedAt: new Date(),
          city: 'Miami',
          country: 'USA'
        }
      }),
      prisma.user.create({
        data: {
          email: 'admin@stylehub.com',
          password: simpleHash('admin123'),
          name: 'Platform Admin',
          role: 'ADMIN',
          phone: '+1234567899',
          isVerified: true,
          verifiedAt: new Date()
        }
      })
    ])

    // Create demo buyer
    const buyer = await prisma.user.create({
      data: {
        email: 'buyer@stylehub.com',
        password: simpleHash('demo123'),
        name: 'Demo Buyer',
        role: 'BUYER',
        phone: '+1234567888',
        loyaltyPoints: 500,
        city: 'San Francisco',
        country: 'USA'
      }
    })

    // Create products
    for (const product of sampleProducts) {
      const sellerIndex = Math.floor(Math.random() * 3)
      const seller = sellers[sellerIndex]
      
      const categoryImages: Record<string, string[]> = {
        shoes: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400'],
        clothes: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400'],
        accessories: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400', 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400']
      }
      
      const images = categoryImages[product.category] || categoryImages.accessories
      
      await prisma.product.create({
        data: {
          ...product,
          sellerId: seller.id,
          images: JSON.stringify(images),
          tags: JSON.stringify(product.tags || []),
          slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          rating: 3.5 + Math.random() * 1.5,
          reviewCount: Math.floor(Math.random() * 50)
        }
      })
    }

    // Create coupons
    for (const coupon of coupons) {
      await prisma.coupon.create({ data: coupon })
    }

    // Create blog posts
    const adminUser = sellers.find(s => s.role === 'ADMIN')
    if (adminUser) {
      for (const post of blogPosts) {
        await prisma.blog.create({
          data: {
            ...post,
            authorId: adminUser.id,
            tags: JSON.stringify(post.tags),
            publishedAt: new Date(),
            coverImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800'
          }
        })
      }
    }

    // Create help categories and articles
    for (const cat of helpCategories) {
      const createdCat = await prisma.helpCategory.create({ data: cat })
      
      // Update articles with category ID
      const catArticles = helpArticles.filter((_, i) => i < 2).map(a => ({ ...a, categoryId: createdCat.id }))
      for (const article of catArticles) {
        await prisma.helpArticle.create({ data: article })
      }
    }

    // Create brands
    for (const brand of brands) {
      await prisma.brand.create({ data: brand })
    }

    // Create banners
    for (const banner of banners) {
      await prisma.banner.create({ data: banner })
    }

    // Create platform settings
    await prisma.platformSettings.create({
      data: {
        platformName: 'StyleHub',
        platformDesc: 'Your Premium Fashion Marketplace - Discover unique styles from trusted sellers worldwide',
        commissionRate: 0.10,
        loyaltyRate: 0.01,
        pointValue: 0.01,
        primaryColor: '#7c3aed',
        secondaryColor: '#ec4899',
        supportEmail: 'support@stylehub.com',
        supportPhone: '+1-800-STYLE-HUB',
        seoTitle: 'StyleHub - Premium Fashion Marketplace',
        seoDesc: 'Shop unique fashion from trusted sellers worldwide. Shoes, clothing, accessories and more.',
        freeShippingThreshold: 50,
        defaultShippingCost: 5.99
      }
    })

    // Create collections
    await prisma.collection.createMany({
      data: [
        { name: 'Summer Essentials', slug: 'summer-essentials', description: 'Must-haves for the sunny season', isFeatured: true },
        { name: 'New Arrivals', slug: 'new-arrivals', description: 'Fresh styles just dropped', isFeatured: true },
        { name: 'Best Sellers', slug: 'best-sellers', description: 'Most loved by our community', isFeatured: true },
        { name: 'Under $50', slug: 'under-50', description: 'Great style doesn\'t have to break the bank', isFeatured: false },
      ]
    })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      stats: {
        sellers: sellers.length,
        products: sampleProducts.length,
        coupons: coupons.length,
        blogPosts: blogPosts.length,
        brands: brands.length,
        banners: banners.length
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed data', details: String(error) }, { status: 500 })
  }
}
