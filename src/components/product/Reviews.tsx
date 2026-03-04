import { StarIcon } from 'lucide-react'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ReviewForm } from './ReviewForm'

type Props = {
  productId: string | number
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className="h-4 w-4"
          fill={rating >= star ? 'currentColor' : 'none'}
          color={rating >= star ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </div>
  )
}

export const Reviews: React.FC<Props> = async ({ productId }) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: reviews, totalDocs } = await payload.find({
    collection: 'reviews',
    where: { product: { equals: productId } },
    sort: '-createdAt',
    limit: 50,
  })

  const avgRating =
    totalDocs > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / totalDocs
      : 0

  return (
    <div className="container py-12">
      <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
        {/* Reviews list */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold">Reviews</h2>
            {totalDocs > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <StarRating rating={Math.round(avgRating)} />
                <span>{avgRating.toFixed(1)} · {totalDocs} review{totalDocs !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reviews yet. Be the first!</p>
          ) : (
            <ul className="flex flex-col gap-6">
              {reviews.map((review) => (
                <li key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{review.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <StarRating rating={review.rating ?? 0} />
                  <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Review form */}
        <div className="lg:w-80 shrink-0">
          <h3 className="text-lg font-semibold mb-4">Write a review</h3>
          <ReviewForm productId={productId} />
        </div>
      </div>
    </div>
  )
}
