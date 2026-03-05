import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

const sampleProducts = [
  // Shoes - Sneakers
  { name: 'Nike Air Max 270 React', description: 'Premium running sneakers with revolutionary air cushion technology and React foam for unmatched comfort. Perfect for daily wear, athletic activities, and casual outings. Features breathable mesh upper and iconic Air Max styling.', price: 179.99, comparePrice: 220.00, category: 'shoes', subCategory: 'sneakers', brand: 'Nike', condition: 'new', stock: 25, featured: true, tags: ['running', 'comfortable', 'trending'] },
  { name: 'Adidas Ultraboost 22', description: 'High-performance running shoes with Boost technology for maximum energy return. Primeknit upper adapts to your foot for a sock-like fit. Continental rubber outsole for superior grip in all conditions.', price: 189.99, comparePrice: 250.00, category: 'shoes', subCategory: 'sneakers', brand: 'Adidas', condition: 'new', stock: 18, featured: true, tags: ['running', 'sports', 'premium'] },
  { name: 'Jordan 1 Retro High OG', description: 'Iconic basketball sneaker that started it all. Premium leather upper with classic color blocking. Air-Sole unit for lightweight cushioning. A must-have for sneaker collectors.', price: 179.99, category: 'shoes', subCategory: 'sneakers', brand: 'Jordan', condition: 'new', stock: 8, featured: true, tags: ['basketball', 'iconic', 'limited'] },
  { name: 'New Balance 990v5', description: 'American-made premium running shoe. ENCAP midsole technology provides support and durability. Pigskin leather and mesh upper for premium feel.', price: 174.99, comparePrice: 200.00, category: 'shoes', subCategory: 'sneakers', brand: 'New Balance', condition: 'new', stock: 22, tags: ['made-in-usa', 'premium', 'running'] },
  { name: 'Converse Chuck Taylor All Star', description: 'Timeless canvas high-top sneaker. OrthoLite insole for comfort. Vulcanized rubber sole. A wardrobe essential for over 100 years.', price: 59.99, comparePrice: 75.00, category: 'shoes', subCategory: 'casual', brand: 'Converse', condition: 'new', stock: 50, tags: ['classic', 'casual', 'versatile'] },
  
  // Shoes - Formal
  { name: 'Oxford Leather Dress Shoes', description: 'Handcrafted Italian leather oxford shoes. Goodyear welt construction for durability and resoleability. Perfect for formal occasions and business wear.', price: 249.99, comparePrice: 350.00, category: 'shoes', subCategory: 'formal', brand: 'Allen Edmonds', condition: 'new', stock: 12, tags: ['formal', 'leather', 'handmade'] },
  { name: 'Classic Loafer Penny', description: 'Timeless penny loafer in premium calfskin leather. Cushioned insole for all-day comfort. Versatile style that works for both casual and semi-formal occasions.', price: 159.99, category: 'shoes', subCategory: 'formal', brand: 'Cole Haan', condition: 'new', stock: 18, tags: ['versatile', 'comfortable', 'classic'] },
  
  // Shoes - Boots
  { name: 'Dr. Martens 1460 8-Eye Boot', description: 'The original Dr. Martens boot. Durable leather upper with signature air-cushioned sole. Goodyear welt construction. An icon of rebellious self-expression.', price: 149.99, category: 'shoes', subCategory: 'boots', brand: 'Dr. Martens', condition: 'new', stock: 30, featured: true, tags: ['iconic', 'durable', 'punk'] },
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
  { name: 'Slim Fit Stretch Jeans', description: 'Modern slim fit jeans with added stretch for comfort. Classic 5-pocket styling. Sustainable denim production. The perfect everyday jean.', price: 89.99, comparePrice: 120.00, category: 'clothes', subCategory: 'jeans', brand: "Levi's", condition: 'new', stock: 80, featured: true, tags: ['classic', 'everyday', 'comfortable'] },
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
  { code: 'WELCOME10', type: 'percentage', value: 10, minPurchase: 50, description: 'Welcome discount for new customers', startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  { code: 'FLASH20', type: 'percentage', value: 20, minPurchase: 100, maxDiscount: 50, description: 'Flash sale - limited time!', startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  { code: 'SAVE25', type: 'fixed', value: 25, minPurchase: 150, description: 'Save $25 on orders over $150', startDate: new Date(), endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
]

// Help Categories
const helpCategories = [
  { name: 'Getting Started', slug: 'getting-started', icon: 'rocket', order: 1 },
  { name: 'Orders & Shipping', slug: 'orders-shipping', icon: 'package', order: 2 },
  { name: 'Returns & Refunds', slug: 'returns-refunds', icon: 'refresh-cw', order: 3 },
  { name: 'Payments', slug: 'payments', icon: 'credit-card', order: 4 },
  { name: 'Account & Profile', slug: 'account-profile', icon: 'user', order: 5 },
  { name: 'Selling on StyleHub', slug: 'selling', icon: 'store', order: 6 },
]

// Help Articles
const helpArticles = [
  {
    title: 'How to Create an Account',
    slug: 'how-to-create-account',
    category: 'Getting Started',
    content: `<p>Creating an account on StyleHub is quick and easy:</p>
    <ol>
      <li>Click the "Sign Up" button in the top right corner</li>
      <li>Enter your email address and create a password</li>
      <li>Verify your email address through the confirmation link</li>
      <li>Complete your profile with your name and preferences</li>
    </ol>
    <p>Once your account is created, you can start shopping immediately!</p>`,
    order: 1
  },
  {
    title: 'Placing Your First Order',
    slug: 'placing-first-order',
    category: 'Getting Started',
    content: `<p>Ready to make your first purchase? Here's how:</p>
    <ol>
      <li>Browse products and add items to your cart</li>
      <li>Review your cart and proceed to checkout</li>
      <li>Enter your shipping address and select a shipping method</li>
      <li>Choose your payment method and complete the purchase</li>
    </ol>
    <p>You'll receive an order confirmation email with tracking information once your order ships.</p>`,
    order: 2
  },
  {
    title: 'Tracking Your Order',
    slug: 'tracking-order',
    category: 'Orders & Shipping',
    content: `<p>You can track your order in several ways:</p>
    <ul>
      <li>Check your email for shipping confirmation with tracking number</li>
      <li>Log into your account and view "My Orders"</li>
      <li>Use the carrier's website with your tracking number</li>
    </ul>
    <p>Most orders are delivered within 3-7 business days depending on your location.</p>`,
    order: 1
  },
  {
    title: 'Shipping Options & Costs',
    slug: 'shipping-options-costs',
    category: 'Orders & Shipping',
    content: `<p>We offer several shipping options:</p>
    <ul>
      <li><strong>Standard Shipping:</strong> 5-7 business days - $4.99</li>
      <li><strong>Express Shipping:</strong> 2-3 business days - $9.99</li>
      <li><strong>Next Day Delivery:</strong> 1 business day - $19.99</li>
      <li><strong>Free Shipping:</strong> Available on orders over $50</li>
    </ul>`,
    order: 2
  },
  {
    title: 'Return Policy',
    slug: 'return-policy',
    category: 'Returns & Refunds',
    content: `<p>We want you to love your purchase! Our return policy:</p>
    <ul>
      <li>Items can be returned within 30 days of delivery</li>
      <li>Items must be unworn, unwashed, and with original tags</li>
      <li>Some items (underwear, swimwear) are final sale</li>
      <li>Return shipping is free for defective items</li>
    </ul>
    <p>To initiate a return, go to "My Orders" and click "Request Return".</p>`,
    order: 1
  },
  {
    title: 'How to Request a Refund',
    slug: 'request-refund',
    category: 'Returns & Refunds',
    content: `<p>To request a refund:</p>
    <ol>
      <li>Go to "My Orders" in your account</li>
      <li>Select the order containing the item you want to return</li>
      <li>Click "Request Return" and select the reason</li>
      <li>Choose your preferred refund method</li>
      <li>Print the return label and ship the item back</li>
    </ol>
    <p>Refunds are processed within 5-7 business days after we receive the item.</p>`,
    order: 2
  },
  {
    title: 'Accepted Payment Methods',
    slug: 'payment-methods',
    category: 'Payments',
    content: `<p>We accept the following payment methods:</p>
    <ul>
      <li>Credit/Debit Cards (Visa, Mastercard, American Express)</li>
      <li>PayPal</li>
      <li>Apple Pay / Google Pay</li>
      <li>StyleHub Gift Cards</li>
      <li>Store Credit</li>
    </ul>
    <p>All payments are processed securely using industry-standard encryption.</p>`,
    order: 1
  },
  {
    title: 'Using Gift Cards',
    slug: 'using-gift-cards',
    category: 'Payments',
    content: `<p>To use a StyleHub gift card:</p>
    <ol>
      <li>Add items to your cart and proceed to checkout</li>
      <li>Enter your gift card code in the "Promo/Gift Code" field</li>
      <li>The gift card balance will be applied to your order</li>
      <li>Any remaining balance can be paid with another method</li>
    </ol>
    <p>Gift cards never expire and can be used on any purchase.</p>`,
    order: 2
  },
  {
    title: 'Updating Your Profile',
    slug: 'updating-profile',
    category: 'Account & Profile',
    content: `<p>To update your profile information:</p>
    <ol>
      <li>Log into your account</li>
      <li>Go to "Account Settings"</li>
      <li>Update your personal information, address, or preferences</li>
      <li>Click "Save Changes"</li>
    </ol>
    <p>You can also manage your notification preferences and privacy settings here.</p>`,
    order: 1
  },
  {
    title: 'Password Reset',
    slug: 'password-reset',
    category: 'Account & Profile',
    content: `<p>If you forgot your password:</p>
    <ol>
      <li>Click "Sign In" and then "Forgot Password"</li>
      <li>Enter the email address associated with your account</li>
      <li>Check your email for the reset link</li>
      <li>Create a new password</li>
    </ol>
    <p>For security, the reset link expires after 24 hours.</p>`,
    order: 2
  },
  {
    title: 'How to Become a Seller',
    slug: 'become-seller',
    category: 'Selling on StyleHub',
    content: `<p>Start selling on StyleHub in 4 steps:</p>
    <ol>
      <li>Create an account and select "Become a Seller"</li>
      <li>Complete your seller profile with store details</li>
      <li>Set up your payment information for payouts</li>
      <li>List your first product and start selling!</li>
    </ol>
    <p>StyleHub charges a small commission on each sale. There are no listing fees.</p>`,
    order: 1
  },
  {
    title: 'Seller Best Practices',
    slug: 'seller-best-practices',
    category: 'Selling on StyleHub',
    content: `<p>Tips for successful selling:</p>
    <ul>
      <li>Use high-quality photos with good lighting</li>
      <li>Write detailed, accurate descriptions</li>
      <li>Price competitively by researching similar items</li>
      <li>Respond to customer questions promptly</li>
      <li>Ship orders within 1-2 business days</li>
      <li>Encourage buyers to leave reviews</li>
    </ul>`,
    order: 2
  },
]

// Size Guides
const sizeGuides = [
  {
    category: 'shoes',
    subCategory: 'sneakers',
    brand: null,
    guideData: JSON.stringify({
      title: 'Sneaker Size Guide',
      sizes: [
        { us: '6', uk: '5', eu: '38.5', cm: '24' },
        { us: '6.5', uk: '5.5', eu: '39', cm: '24.5' },
        { us: '7', uk: '6', eu: '40', cm: '25' },
        { us: '7.5', uk: '6.5', eu: '40.5', cm: '25.5' },
        { us: '8', uk: '7', eu: '41', cm: '26' },
        { us: '8.5', uk: '7.5', eu: '42', cm: '26.5' },
        { us: '9', uk: '8', eu: '42.5', cm: '27' },
        { us: '9.5', uk: '8.5', eu: '43', cm: '27.5' },
        { us: '10', uk: '9', eu: '44', cm: '28' },
        { us: '10.5', uk: '9.5', eu: '44.5', cm: '28.5' },
        { us: '11', uk: '10', eu: '45', cm: '29' },
        { us: '12', uk: '11', eu: '46', cm: '30' },
      ]
    }),
    instructions: 'Measure your foot length in centimeters and compare to the size chart. For the best fit, measure at the end of the day when feet are at their largest.'
  },
  {
    category: 'shoes',
    subCategory: 'boots',
    brand: null,
    guideData: JSON.stringify({
      title: 'Boot Size Guide',
      sizes: [
        { us: '6', uk: '5', eu: '38.5', cm: '24' },
        { us: '7', uk: '6', eu: '40', cm: '25' },
        { us: '8', uk: '7', eu: '41', cm: '26' },
        { us: '9', uk: '8', eu: '42.5', cm: '27' },
        { us: '10', uk: '9', eu: '44', cm: '28' },
        { us: '11', uk: '10', eu: '45', cm: '29' },
        { us: '12', uk: '11', eu: '46', cm: '30' },
      ]
    }),
    instructions: 'Boots typically run true to size. If you plan to wear thick socks, consider going up half a size.'
  },
  {
    category: 'clothes',
    subCategory: 't-shirts',
    brand: null,
    guideData: JSON.stringify({
      title: 'T-Shirt Size Guide',
      sizes: [
        { size: 'XS', chest: '32-34', waist: '26-28', length: '27' },
        { size: 'S', chest: '35-37', waist: '29-31', length: '28' },
        { size: 'M', chest: '38-40', waist: '32-34', length: '29' },
        { size: 'L', chest: '41-43', waist: '35-37', length: '30' },
        { size: 'XL', chest: '44-46', waist: '38-40', length: '31' },
        { size: 'XXL', chest: '47-49', waist: '41-43', length: '32' },
      ]
    }),
    instructions: 'Measure around the fullest part of your chest and natural waist. Compare to the chart for your best fit.'
  },
  {
    category: 'clothes',
    subCategory: 'jeans',
    brand: null,
    guideData: JSON.stringify({
      title: 'Jeans Size Guide',
      sizes: [
        { size: '28', waist: '28', hip: '35', inseam: '30' },
        { size: '30', waist: '30', hip: '37', inseam: '30' },
        { size: '32', waist: '32', hip: '39', inseam: '32' },
        { size: '34', waist: '34', hip: '41', inseam: '32' },
        { size: '36', waist: '36', hip: '43', inseam: '32' },
        { size: '38', waist: '38', hip: '45', inseam: '34' },
      ]
    }),
    instructions: 'Jeans sizes are typically listed as waist x inseam (e.g., 32x32). Measure your natural waist and inseam for accurate sizing.'
  },
  {
    category: 'clothes',
    subCategory: 'dresses',
    brand: null,
    guideData: JSON.stringify({
      title: 'Dress Size Guide',
      sizes: [
        { size: 'XS', bust: '32-33', waist: '24-25', hip: '34-35' },
        { size: 'S', bust: '34-35', waist: '26-27', hip: '36-37' },
        { size: 'M', bust: '36-37', waist: '28-29', hip: '38-39' },
        { size: 'L', bust: '38-40', waist: '30-32', hip: '40-42' },
        { size: 'XL', bust: '41-43', waist: '33-35', hip: '43-45' },
      ]
    }),
    instructions: 'Measure bust at fullest part, waist at natural waistline, and hips at widest point. If between sizes, size up for comfort.'
  },
]

// Brands
const brands = [
  { name: 'Nike', slug: 'nike', description: 'Just Do It. The world\'s leading athletic brand.', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
  { name: 'Adidas', slug: 'adidas', description: 'Impossible is Nothing. German engineering meets sport.', logo: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200' },
  { name: 'Jordan', slug: 'jordan', description: 'The legendary brand born from basketball greatness.', logo: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200' },
  { name: 'Levi\'s', slug: 'levis', description: 'The original blue jean since 1873.', logo: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200' },
  { name: 'Ray-Ban', slug: 'ray-ban', description: 'Never Hide. Iconic eyewear since 1937.', logo: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200' },
  { name: 'Dr. Martens', slug: 'dr-martens', description: 'Rebellious self-expression since 1947.', logo: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=200' },
  { name: 'Converse', slug: 'converse', description: 'The iconic Chuck Taylor All Star.', logo: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=200' },
  { name: 'New Balance', slug: 'new-balance', description: 'Fearlessly Independent Since 1906.', logo: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=200' },
  { name: 'Timberland', slug: 'timberland', description: 'Nature needs heroes. Premium outdoor footwear.', logo: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=200' },
  { name: 'Under Armour', slug: 'under-armour', description: 'The only way is through. Performance apparel.', logo: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=200' },
]

// Collections
const collections = [
  { name: 'Summer Essentials', slug: 'summer-essentials', description: 'Beat the heat with our curated summer collection', image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800' },
  { name: 'Streetwear Icons', slug: 'streetwear-icons', description: 'Urban style staples for the fashion-forward', image: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800' },
  { name: 'Office Ready', slug: 'office-ready', description: 'Professional looks that mean business', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800' },
  { name: 'Weekend Warriors', slug: 'weekend-warriors', description: 'Casual comfort for your days off', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800' },
  { name: 'Athletic Performance', slug: 'athletic-performance', description: 'Gear up for your best workout', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800' },
  { name: 'Sustainable Fashion', slug: 'sustainable-fashion', description: 'Eco-conscious choices for a better tomorrow', image: 'https://images.unsplash.com/photo-1523199455310-87b16c0eed11?w=800' },
]

// Announcements
const announcements = [
  { title: 'Free Shipping on Orders Over $50!', message: 'For a limited time, enjoy free standard shipping on all orders over $50. No code needed!', type: 'promotion', isActive: true },
  { title: 'Summer Sale Coming Soon', message: 'Get ready for our biggest sale of the season. Up to 50% off select items starting next week!', type: 'promotion', isActive: true, startDate: new Date(), endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
  { title: 'New Payment Option', message: 'We now accept Apple Pay and Google Pay for faster, more secure checkout.', type: 'info', isActive: true },
  { title: 'Seller Program Update', message: 'Lower commission rates for new sellers! Start your store today with just 8% commission for your first 3 months.', type: 'success', isActive: true },
]

export async function POST(request: NextRequest) {
  try {
    // Create demo sellers with more details
    const sellers = await Promise.all([
      db.user.create({
        data: {
          email: 'fashion@stylehub.com',
          password: simpleHash('demo123'),
          name: 'StyleHub Fashion',
          role: 'SELLER',
          storeName: 'StyleHub Official Store',
          storeDesc: 'Premium fashion items curated for the modern lifestyle. We bring you the latest trends and timeless classics.',
          storeBanner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
          storeLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
          phone: '+1234567890',
          isVerified: true,
          verifiedAt: new Date(),
          bio: 'Your trusted source for premium fashion',
          website: 'https://stylehub.com',
          city: 'New York',
          country: 'USA'
        }
      }),
      db.user.create({
        data: {
          email: 'sneakers@stylehub.com',
          password: simpleHash('demo123'),
          name: 'Sneaker Paradise',
          role: 'SELLER',
          storeName: 'Sneaker Paradise',
          storeDesc: 'Authentic sneakers from top brands worldwide. All shoes are 100% genuine and carefully inspected.',
          storeBanner: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200',
          storeLogo: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=200',
          phone: '+1234567891',
          isVerified: true,
          verifiedAt: new Date(),
          bio: 'Sneaker enthusiasts since 2015',
          city: 'Los Angeles',
          country: 'USA'
        }
      }),
      db.user.create({
        data: {
          email: 'luxury@stylehub.com',
          password: simpleHash('demo123'),
          name: 'Luxury Lane',
          role: 'SELLER',
          storeName: 'Luxury Lane',
          storeDesc: 'High-end fashion and accessories for the discerning buyer. Luxury without compromise.',
          storeBanner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
          storeLogo: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200',
          phone: '+1234567892',
          isVerified: true,
          verifiedAt: new Date(),
          bio: 'Curated luxury since 2010',
          city: 'Miami',
          country: 'USA'
        }
      }),
      db.user.create({
        data: {
          email: 'vintage@stylehub.com',
          password: simpleHash('demo123'),
          name: 'Vintage Vibes',
          role: 'SELLER',
          storeName: 'Vintage Vibes',
          storeDesc: 'Authentic vintage and retro fashion. Unique pieces with history and character.',
          storeBanner: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
          phone: '+1234567893',
          isVerified: false,
          bio: 'Bringing the past to your present',
          city: 'Portland',
          country: 'USA'
        }
      }),
      db.user.create({
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
    const buyer = await db.user.create({
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
      const sellerIndex = Math.floor(Math.random() * 4)
      const seller = sellers[sellerIndex]
      
      // Generate random images based on category
      const categoryImages: Record<string, string[]> = {
        shoes: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
          'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400',
        ],
        clothes: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400',
        ],
        accessories: [
          'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
          'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400',
        ]
      }
      
      const images = categoryImages[product.category] || categoryImages.accessories
      const randomImage = images[Math.floor(Math.random() * images.length)]
      
      await db.product.create({
        data: {
          ...product,
          sellerId: seller.id,
          images: JSON.stringify([randomImage]),
          tags: JSON.stringify(product.tags || []),
          rating: 3.5 + Math.random() * 1.5,
          reviewCount: Math.floor(Math.random() * 50),
          soldCount: Math.floor(Math.random() * 100)
        }
      })
    }

    // Create coupons
    for (const coupon of coupons) {
      await db.coupon.create({ data: coupon })
    }

    // Create blog posts
    const adminUser = sellers.find(s => s.role === 'ADMIN')
    if (adminUser) {
      for (const post of blogPosts) {
        await db.blog.create({
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

    // Create platform settings
    await db.platformSettings.create({
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
        seoKeywords: 'fashion, marketplace, shoes, clothing, accessories, online shopping'
      }
    })

    // Create help categories
    for (const category of helpCategories) {
      await db.helpCategory.create({ data: category })
    }

    // Create help articles
    for (const article of helpArticles) {
      await db.helpArticle.create({
        data: {
          title: article.title,
          slug: article.slug,
          content: article.content,
          category: article.category,
          order: article.order,
          isPublished: true
        }
      })
    }

    // Create size guides
    for (const guide of sizeGuides) {
      await db.sizeGuide.create({
        data: {
          category: guide.category,
          subCategory: guide.subCategory,
          brand: guide.brand,
          guideData: guide.guideData,
          instructions: guide.instructions,
          isActive: true
        }
      })
    }

    // Create brands
    for (const brand of brands) {
      await db.brand.create({
        data: {
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          logo: brand.logo,
          isActive: true
        }
      })
    }

    // Create collections
    for (const collection of collections) {
      await db.collection.create({
        data: {
          name: collection.name,
          slug: collection.slug,
          description: collection.description,
          image: collection.image,
          productIds: '[]',
          isActive: true
        }
      })
    }

    // Create announcements
    for (const announcement of announcements) {
      await db.announcement.create({
        data: announcement
      })
    }

    // Create a sample address for the buyer
    await db.address.create({
      data: {
        userId: buyer.id,
        name: 'Demo Buyer',
        phone: '+1234567888',
        address: '123 Fashion Street',
        city: 'San Francisco',
        state: 'California',
        country: 'USA',
        postalCode: '94102',
        isDefault: true,
        addressType: 'shipping'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      stats: {
        sellers: sellers.length,
        products: sampleProducts.length,
        coupons: coupons.length,
        blogPosts: blogPosts.length,
        helpCategories: helpCategories.length,
        helpArticles: helpArticles.length,
        sizeGuides: sizeGuides.length,
        brands: brands.length,
        collections: collections.length,
        announcements: announcements.length
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed data', details: String(error) }, { status: 500 })
  }
}
