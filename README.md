# 🛍️ StyleHub Marketplace

<div align="center">

![StyleHub Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop)

**A World-Class Multi-Vendor E-Commerce Platform - Built with Zero Budget!**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

**[Live Demo](https://github.com/hamtechug256/stylehub-marketplace)** • **[Report Bug](https://github.com/hamtechug256/stylehub-marketplace/issues)** • **[Request Feature](https://github.com/hamtechug256/stylehub-marketplace/issues)**

</div>

---

## 🌟 Features Overview

### 🛒 Core E-Commerce
| Feature | Description |
|---------|-------------|
| **Multi-Vendor System** | Multiple sellers can list and sell products |
| **Product Catalog** | 50+ sample products across categories |
| **Shopping Cart** | Full cart with quantity management |
| **Secure Checkout** | Cash on delivery with order tracking |
| **Coupon System** | Discount codes (WELCOME10, FLASH20, SAVE25) |

### 👤 User Features
| Feature | Description |
|---------|-------------|
| **Authentication** | Login/Register with role selection |
| **User Roles** | Buyer, Seller, and Admin |
| **Wishlist** | Save favorite products |
| **Reviews & Ratings** | Rate and review products |
| **Loyalty Points** | Earn points on every purchase |
| **Order History** | Track all orders |
| **Address Book** | Save multiple addresses |
| **Price Alerts** | Get notified on price drops |

### 🏪 Seller Dashboard
| Feature | Description |
|---------|-------------|
| **Product Management** | Add, edit, delete products |
| **Order Fulfillment** | Process and ship orders |
| **Analytics** | View sales and performance |
| **Store Profile** | Customizable seller profile |
| **Payout System** | Withdraw earnings |

### 🆕 NEW FEATURES!
| Feature | Description |
|---------|-------------|
| **Product Comparison** | Compare up to 4 products |
| **Recently Viewed** | Track browsing history |
| **Gift Cards** | Purchase & redeem gift cards |
| **Referral Program** | Earn rewards for referrals |
| **Returns & Refunds** | Request and track returns |
| **Help Center** | FAQ and support articles |
| **Size Guide** | Comprehensive sizing info |
| **Flash Sales** | Limited-time deals |
| **Deals Page** | All promotions in one place |
| **New Arrivals** | Recently added products |
| **Best Sellers** | Top selling items |
| **Brands Page** | Shop by brand |
| **Collections** | Curated product lists |
| **Contact Page** | Contact form and info |
| **Privacy Policy** | Legal compliance |
| **Terms of Service** | Terms and conditions |

### 📝 Content & Communication
| Feature | Description |
|---------|-------------|
| **Blog System** | Fashion articles and tips |
| **Messaging** | Buyer-seller communication |
| **Notifications** | Real-time alerts |
| **Announcements** | Platform announcements |

### 🎨 UI/UX
| Feature | Description |
|---------|-------------|
| **Dark Mode** | Toggle between themes |
| **Responsive Design** | Works on all devices |
| **Smooth Animations** | Framer Motion powered |
| **Professional UI** | shadcn/ui components |

---

## 📊 Database Models

The platform uses **30+ database models**:

```
User → Products, Orders, Reviews, Wishlist, Messages, Notifications
Product → Images, Variants, FlashSale, Questions
Order → OrderItems, Returns
Coupon → UserCoupons
GiftCard, Referral, PriceAlert, RecentlyViewed
Address, Brand, Collection, SizeGuide
HelpArticle, HelpCategory, Announcement
AuditLog, SellerPayout, ProductView
Cart, ContactMessage, Newsletter
PlatformSettings
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/hamtechug256/stylehub-marketplace.git

# Navigate to project
cd stylehub-marketplace

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👑 Admin | admin@stylehub.com | admin123 |
| 🛍️ Buyer | buyer@stylehub.com | demo123 |
| 🏪 Seller | fashion@stylehub.com | demo123 |

---

## 🎁 Active Coupons

| Code | Discount | Min. Purchase |
|------|----------|---------------|
| WELCOME10 | 10% off | $50 |
| FLASH20 | 20% off | $100 |
| SAVE25 | $25 off | $150 |

---

## 📁 Project Structure

```
stylehub-marketplace/
├── prisma/
│   └── schema.prisma      # 30+ database models
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── addresses/    # Address management
│   │   │   ├── announcements/# Platform announcements
│   │   │   ├── auth/         # Authentication
│   │   │   ├── blog/         # Blog posts
│   │   │   ├── compare/      # Product comparison
│   │   │   ├── coupons/      # Discount codes
│   │   │   ├── follow/       # User following
│   │   │   ├── giftcards/    # Gift cards
│   │   │   ├── help/         # Help center
│   │   │   ├── messages/     # Messaging
│   │   │   ├── notifications/
│   │   │   ├── orders/       # Order management
│   │   │   ├── price-alerts/ # Price alerts
│   │   │   ├── products/     # Product CRUD
│   │   │   ├── questions/    # Product Q&A
│   │   │   ├── recently-viewed/
│   │   │   ├── referrals/    # Referral program
│   │   │   ├── returns/      # Returns & refunds
│   │   │   ├── reviews/      # Reviews
│   │   │   ├── seed/         # Sample data
│   │   │   ├── settings/     # Platform settings
│   │   │   └── wishlist/     # Wishlist
│   │   ├── page.tsx          # Main application
│   │   └── layout.tsx        # Root layout
│   ├── components/ui/        # UI components
│   └── lib/
│       ├── store.ts          # Zustand stores
│       ├── db.ts              # Database client
│       └── utils.ts           # Utilities
└── package.json
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite + Prisma ORM |
| State | Zustand |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Animations | Framer Motion |
| Icons | Lucide React |
| Notifications | Sonner |

---

## 💰 Revenue Model

- **Commission Rate**: 10% (configurable)
- **Sellers Keep**: 90% of each sale
- **Platform Earns**: On every successful transaction
- **Gift Cards**: Additional revenue stream
- **Featured Listings**: Future premium feature

---

## 🌟 Key Highlights

1. **Zero Budget Solution** - SQLite database, no external services
2. **Production Ready** - Professional UI/UX, complete functionality
3. **Scalable Architecture** - Clean code, modular design
4. **Mobile First** - Responsive across all devices
5. **SEO Optimized** - Next.js App Router with metadata
6. **30+ Features** - Competes with major platforms
7. **100% Free** - No hosting costs with SQLite

---

## 📈 Feature Comparison

| Feature | StyleHub | Amazon | Etsy | eBay |
|---------|----------|--------|------|------|
| Multi-vendor | ✅ | ✅ | ✅ | ✅ |
| Product Comparison | ✅ | ✅ | ❌ | ✅ |
| Gift Cards | ✅ | ✅ | ✅ | ❌ |
| Referral Program | ✅ | ❌ | ❌ | ❌ |
| Price Alerts | ✅ | ✅ | ❌ | ✅ |
| Flash Sales | ✅ | ✅ | ❌ | ❌ |
| Dark Mode | ✅ | ✅ | ❌ | ✅ |
| Blog System | ✅ | ❌ | ✅ | ❌ |
| Help Center | ✅ | ✅ | ✅ | ✅ |
| **Cost to Run** | **$0** | $$ | $$ | $$ |

---

## 🔮 Future Roadmap

- [ ] Payment gateway (Stripe/PayPal)
- [ ] Real-time chat
- [ ] Image upload (Cloudinary)
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] AI recommendations
- [ ] Multi-currency
- [ ] Live streaming sales
- [ ] AR try-on

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by [hamtechug256](https://github.com/hamtechug256)**

⭐ If you like this project, give it a star! ⭐

**[⬆ Back to Top](#-stylehub-marketplace)**

</div>