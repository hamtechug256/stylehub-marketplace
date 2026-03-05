import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const id = searchParams.get('id')
    const category = searchParams.get('category')

    if (slug) {
      const blog = await prisma.blog.findUnique({
        where: { slug },
        include: {
          author: { select: { id: true, name: true, avatar: true } }
        }
      })
      
      if (blog) {
        await prisma.blog.update({
          where: { id: blog.id },
          data: { views: { increment: 1 } }
        })
      }
      
      return NextResponse.json(blog)
    }

    if (id) {
      const blog = await prisma.blog.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, name: true, avatar: true } }
        }
      })
      return NextResponse.json(blog)
    }

    const where: any = { status: 'published' }
    if (category) where.category = category

    const blogs = await prisma.blog.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { publishedAt: 'desc' }
    })

    return NextResponse.json(blogs)
  } catch (error) {
    console.error('Get blogs error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, content, excerpt, coverImage, authorId, category, tags, status } = body

    const existing = await prisma.blog.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        authorId,
        category,
        tags: JSON.stringify(tags || []),
        status,
        publishedAt: status === 'published' ? new Date() : null
      }
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Create blog error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (updates.tags) updates.tags = JSON.stringify(updates.tags)
    if (updates.status === 'published' && !updates.publishedAt) {
      updates.publishedAt = new Date()
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: updates
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Update blog error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.blog.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete blog error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
