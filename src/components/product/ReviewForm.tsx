'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  productId: string | number
}

export const ReviewForm: React.FC<Props> = ({ productId }) => {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) {
      toast.error('Please select a star rating.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, name, email, rating, body }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit review.')
      }

      setSubmitted(true)
      toast.success('Review submitted!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">Thanks for your review!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Star rating */}
      <div>
        <Label>Rating</Label>
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <StarIcon
                className="h-7 w-7 transition-colors"
                fill={(hovered || rating) >= star ? 'currentColor' : 'none'}
                color={(hovered || rating) >= star ? '#f59e0b' : '#d1d5db'}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="review-name">Name</Label>
        <Input
          id="review-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="review-email">Email</Label>
        <Input
          id="review-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="review-body">Review</Label>
        <textarea
          id="review-body"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? 'Submitting...' : 'Submit review'}
      </Button>
    </form>
  )
}
