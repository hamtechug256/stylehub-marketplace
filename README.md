# 🛍️ StyleHub Marketplace

<div align="center">

![StyleHub Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop)

**A World-Class Multi-Vendor E-Commerce Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

</div>

---

## ✨ Features

### 🛒 E-Commerce Core
- **Multi-Vendor System** - Multiple sellers can list products
- **Product Catalog** - 50+ sample products across categories
- **Shopping Cart** - Full cart functionality with quantity management
- **Checkout System** - Cash on delivery with order tracking
- **Coupon System** - Discount codes (WELCOME10, FLASH20, SAVE25)

### 👤 User Features
- **Authentication** - Login/Register with role selection
- **User Roles** - Buyer, Seller, and Admin
- **Wishlist** - Save favorite products
- **Reviews & Ratings** - Rate and review products
- **Loyalty Points** - Earn points on every purchase
- **Order History** - Track all orders

### 🏪 Seller Dashboard
- **Product Management** - Add, edit, delete products
- **Order Fulfillment** - Process and ship orders
- **Analytics** - View sales and performance
- **Store Profile** - Customizable seller profile

### 📝 Content & Communication
- **Blog System** - Fashion articles and tips
- **Messaging** - Buyer-seller communication
- **Notifications** - Real-time alerts

### 🎨 UI/UX
- **Dark Mode** - Toggle between themes
- **Responsive Design** - Works on all devices
- **Smooth Animations** - Framer Motion powered
- **Professional UI** - shadcn/ui components

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
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication
│   │   │   ├── blog/      # Blog posts
│   │   │   ├── coupons/   # Discount codes
│   │   │   ├── follow/    # User following
│   │   │   ├── messages/  # Messaging system
│   │   │   ├── notifications/
│   │   │   ├── orders/    # Order management
│   │   │   ├── products/  # Product CRUD
│   │   │   ├── reviews/   # Reviews & ratings
│   │   │   ├── seed/      # Sample data
│   │   │   ├── settings/  # Platform settings
│   │   │   └── wishlist/  # Wishlist
│   │   ├── page.tsx       # Main application
│   │   └── layout.tsx     # Root layout
│   ├── components/ui/     # UI components
│   └── lib/
│       ├── store.ts       # Zustand stores
│       ├── db.ts          # Database client
│       └── utils.ts       # Utilities
└── package.json
```

---

## 🗃️ Database Models

- **User** - Buyers, Sellers, Admins
- **Product** - Items for sale
- **Order** - Purchase records
- **OrderItem** - Items in orders
- **Review** - Product reviews
- **Wishlist** - Saved products
- **Message** - User messages
- **Notification** - Alerts
- **Coupon** - Discount codes
- **Blog** - Blog posts
- **Follow** - User relationships

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

---

## 💰 Revenue Model

- **Commission Rate**: 10% (configurable)
- **Sellers Keep**: 90% of each sale
- **Platform Earns**: On every successful transaction

---

## 🌟 Key Highlights

1. **Zero Budget Solution** - SQLite database, no external services required
2. **Production Ready** - Professional UI/UX, complete functionality
3. **Scalable Architecture** - Clean code, modular design
4. **Mobile First** - Responsive across all devices
5. **SEO Optimized** - Next.js App Router with metadata

---

## 📈 Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Real-time chat with WebSocket
- [ ] Image upload with Cloudinary
- [ ] Email notifications with Resend
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Multi-currency support

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

</div>
