import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, name, email, rating, body: reviewBody } = body

    if (!productId || !name || !email || !rating || !reviewBody) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    const review = await payload.create({
      collection: 'reviews',
      data: {
        product: productId,
        name,
        email,
        rating,
        body: reviewBody,
      },
    })

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (err) {
    console.error('Error creating review:', err)
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'productId is required.' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    const reviews = await payload.find({
      collection: 'reviews',
      where: {
        product: { equals: productId },
      },
      sort: '-createdAt',
      limit: 50,
    })

    return NextResponse.json(reviews)
  } catch (err) {
    console.error('Error fetching reviews:', err)
    return NextResponse.json({ error: 'Failed to fetch reviews.' }, { status: 500 })
  }
}
