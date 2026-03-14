import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get help articles and categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const slug = searchParams.get('slug')
    const articleId = searchParams.get('articleId')
    const search = searchParams.get('search')

    // Get single article by ID
    if (articleId) {
      const article = await db.helpArticle.findUnique({
        where: { id: articleId }
      })
      
      // Increment view count
      if (article) {
        await db.helpArticle.update({
          where: { id: articleId },
          data: { views: { increment: 1 } }
        })
      }
      
      return NextResponse.json(article)
    }

    // Get single article by slug
    if (slug) {
      const article = await db.helpArticle.findUnique({
        where: { slug }
      })
      
      // Increment view count
      if (article) {
        await db.helpArticle.update({
          where: { slug },
          data: { views: { increment: 1 } }
        })
      }
      
      return NextResponse.json(article)
    }

    // Search articles
    if (search) {
      const articles = await db.helpArticle.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: search } },
            { content: { contains: search } }
          ]
        },
        orderBy: { views: 'desc' },
        take: 20
      })
      return NextResponse.json({ articles, categories: [] })
    }

    // Get categories
    const categories = await db.helpCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    // Get articles by category
    const where: Record<string, unknown> = { isPublished: true }
    if (category) where.category = category

    const articles = await db.helpArticle.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ categories, articles })
  } catch (error) {
    console.error('Get help articles error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST: Create article (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, content, category, order, isPublished } = body

    if (!title || !slug || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await db.helpArticle.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json({ error: 'Article with this slug already exists' }, { status: 400 })
    }

    const article = await db.helpArticle.create({
      data: {
        title,
        slug,
        content,
        category,
        order: order || 0,
        isPublished: isPublished !== undefined ? isPublished : true
      }
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    console.error('Create help article error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT: Update article
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, slug, content, category, order, isPublished } = body

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    const existing = await db.helpArticle.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if new slug conflicts with another article
    if (slug && slug !== existing.slug) {
      const slugConflict = await db.helpArticle.findUnique({
        where: { slug }
      })
      if (slugConflict) {
        return NextResponse.json({ error: 'Article with this slug already exists' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (content !== undefined) updateData.content = content
    if (category !== undefined) updateData.category = category
    if (order !== undefined) updateData.order = order
    if (isPublished !== undefined) updateData.isPublished = isPublished

    const article = await db.helpArticle.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(article)
  } catch (error) {
    console.error('Update help article error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE: Delete article
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    await db.helpArticle.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Article deleted' })
  } catch (error) {
    console.error('Delete help article error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
