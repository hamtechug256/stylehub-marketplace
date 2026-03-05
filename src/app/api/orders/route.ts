import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get commission rate
async function getCommissionRate(): Promise<number> {
  const settings = await prisma.platformSettings.findFirst()
  return settings?.commissionRate || 0.10
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')
    const buyerId = searchParams.get('buyerId')
    const sellerId = searchParams.get('sellerId')

    // Get single order
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          buyer: { select: { id: true, name: true, email: true, phone: true } },
          items: {
            include: {
              product: {
                include: {
                  seller: { select: { id: true, name: true, storeName: true } }
                }
              }
            }
          }
        }
      })
      return NextResponse.json(order)
    }

    // Get orders by buyer
    if (buyerId) {
      const orders = await prisma.order.findMany({
        where: { buyerId },
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: { select: { id: true, name: true, storeName: true } }
                }
              }
            }
          }
        }
      })
      return NextResponse.json(orders)
    }

    // Get orders by seller (orders containing their products)
    if (sellerId) {
      const orderItems = await prisma.orderItem.findMany({
        where: { sellerId },
        orderBy: { order: { createdAt: 'desc' } },
        include: {
          order: {
            include: {
              buyer: { select: { id: true, name: true, email: true, phone: true } }
            }
          },
          product: true
        }
      })
      
      // Group by order
      const ordersMap = new Map()
      for (const item of orderItems) {
        if (!ordersMap.has(item.orderId)) {
          ordersMap.set(item.orderId, {
            ...item.order,
            items: []
          })
        }
        ordersMap.get(item.orderId).items.push(item)
      }
      
      return NextResponse.json(Array.from(ordersMap.values()))
    }

    // Get all orders (admin)
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, price: true } }
          }
        }
      }
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyerId, items, shippingAddress, buyerPhone, notes, paymentMethod } = body
    
    const commissionRate = await getCommissionRate()
    
    // Calculate totals
    let totalAmount = 0
    let totalCommission = 0
    let totalSellerEarnings = 0
    
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) continue
      
      const itemTotal = product.price * item.quantity
      const itemCommission = itemTotal * commissionRate
      const itemEarnings = itemTotal - itemCommission
      
      totalAmount += itemTotal
      totalCommission += itemCommission
      totalSellerEarnings += itemEarnings
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerId,
        totalAmount,
        commission: totalCommission,
        sellerEarnings: totalSellerEarnings,
        paymentMethod: paymentMethod || 'cash',
        shippingAddress,
        buyerPhone,
        notes,
        items: {
          create: await Promise.all(items.map(async (item: any) => {
            const product = await prisma.product.findUnique({ where: { id: item.productId } })
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product!.price,
              sellerId: product!.sellerId
            }
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, paymentStatus } = body

    const order = await prisma.order.update({
      where: { id },
      data: { 
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus })
      }
    })

    // If order is delivered, add earnings to seller balance
    if (status === 'delivered') {
      const orderItems = await prisma.orderItem.findMany({ where: { orderId: id } })
      const sellerEarnings = new Map<string, number>()
      
      for (const item of orderItems) {
        const current = sellerEarnings.get(item.sellerId) || 0
        sellerEarnings.set(item.sellerId, current + (item.price * item.quantity))
      }
      
      for (const [sellerId, earnings] of sellerEarnings) {
        const commission = earnings * (await getCommissionRate())
        const netEarnings = earnings - commission
        
        await prisma.user.update({
          where: { id: sellerId },
          data: { balance: { increment: netEarnings } }
        })
      }
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
