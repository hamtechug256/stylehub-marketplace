import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get user addresses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const addressId = searchParams.get('id')
    const addressType = searchParams.get('type')

    // Get single address
    if (addressId) {
      const address = await db.address.findUnique({
        where: { id: addressId }
      })
      return NextResponse.json(address)
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Build filter
    const where: Record<string, unknown> = { userId }
    if (addressType) where.addressType = addressType

    const addresses = await db.address.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Get addresses error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Add address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, name, phone, address, city, state, country, postalCode, isDefault, addressType } = body

    // Validate required fields
    if (!userId || !name || !phone || !address || !city || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await db.address.updateMany({
        where: { userId, addressType: addressType || 'shipping' },
        data: { isDefault: false }
      })
    }

    const newAddress = await db.address.create({
      data: {
        userId,
        name,
        phone,
        address,
        city,
        state: state || null,
        country,
        postalCode: postalCode || null,
        isDefault: isDefault || false,
        addressType: addressType || 'shipping'
      }
    })

    return NextResponse.json(newAddress, { status: 201 })
  } catch (error) {
    console.error('Create address error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Update address
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, userId, name, phone, address, city, state, country, postalCode, isDefault, addressType } = body

    if (!id || !userId) {
      return NextResponse.json({ error: 'Address ID and User ID are required' }, { status: 400 })
    }

    // Verify address belongs to user
    const existingAddress = await db.address.findUnique({
      where: { id }
    })

    if (!existingAddress || existingAddress.userId !== userId) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 })
    }

    // If setting as default, remove default from other addresses
    if (isDefault) {
      await db.address.updateMany({
        where: { 
          userId, 
          addressType: addressType || existingAddress.addressType,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (country !== undefined) updateData.country = country
    if (postalCode !== undefined) updateData.postalCode = postalCode
    if (isDefault !== undefined) updateData.isDefault = isDefault
    if (addressType !== undefined) updateData.addressType = addressType

    const updatedAddress = await db.address.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Update address error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Delete address
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!id || !userId) {
      return NextResponse.json({ error: 'Address ID and User ID are required' }, { status: 400 })
    }

    // Verify address belongs to user
    const address = await db.address.findUnique({
      where: { id }
    })

    if (!address || address.userId !== userId) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 })
    }

    await db.address.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Address deleted' })
  } catch (error) {
    console.error('Delete address error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
