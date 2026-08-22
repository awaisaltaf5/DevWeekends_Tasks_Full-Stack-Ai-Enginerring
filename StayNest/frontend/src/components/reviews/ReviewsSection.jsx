import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Star, Send, Trash2, Pencil, Loader2, LogIn } from 'lucide-react'
import {
  fetchReviews,
  createReview,
  updateReview,
  deleteReview,
  resetReviews,
} from '../../features/reviews/reviewsSlice'
import Card from '../ui/Card'
import StarRating from '../ui/StarRating'
import Button from '../ui/Button'

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=120&q=80'

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })

/**
 * Reviews panel on the hotel detail page.
 * Shows the average rating + 5-star breakdown, a write/edit form (auth users
 * only), and per-review edit/delete for the reviewer. Ownership of edits and
 * deletions is enforced server-side; the client only shows/hides controls.
 */
export default function ReviewsSection({ hotelId }) {
  const dispatch = useDispatch()
  const { reviews, loading, reviewing, error } = useSelector((s) => s.reviews)
  const { token, currentUser } = useSelector((s) => s.auth)

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ rating: 5, comment: '' })

  useEffect(() => {
    dispatch(fetchReviews(hotelId))
    return () => dispatch(resetReviews())
  }, [dispatch, hotelId])

  const canWrite = Boolean(token)
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }))
  const average =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  // The authenticated user's existing review for this hotel, if any. The form
  // switches into "edit" mode when one exists. The server is the source of
  // truth for ownership; this is only a UI convenience.
  const myReview = reviews.find((r) => r.user?.id === currentUser?.id)
  const editingReview = editing ? reviews.find((r) => r.id === editing) : myReview
  const isEditMode = Boolean(editingReview)

  useEffect(() => {
    if (myReview && !editing) {
      setForm({ rating: myReview.rating, comment: myReview.comment || '' })
    }
  }, [myReview, editing])

  const handleSubmit = async () => {
    if (isEditMode) {
      const res = await dispatch(
        updateReview({
          id: editing ?? myReview?.id,
          rating: form.rating,
          comment: form.comment,
        })
      )
      if (updateReview.fulfilled.match(res)) {
        setEditing(null)
        setForm({ rating: 5, comment: '' })
      }
      return
    }
    const res = await dispatch(
      createReview({ hotelId, rating: form.rating, comment: form.comment })
    )
    if (createReview.fulfilled.match(res)) {
      setForm({ rating: 5, comment: '' })
    }
  }

  const handleDelete = (reviewId) => {
    if (window.confirm('Delete this review?')) {
      dispatch(deleteReview(reviewId))
    }
  }

  const startEdit = (review) => {
    setEditing(review.id)
    setForm({ rating: review.rating, comment: review.comment || '' })
  }

  const handleCancel = () => {
    setEditing(null)
    if (myReview) setForm({ rating: myReview.rating, comment: myReview.comment || '' })
    else setForm({ rating: 5, comment: '' })
  }

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-foreground">Guest reviews</h2>
        {reviews.length > 0 && (
          <span className="text-sm text-muted">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="mt-6">
          <div className="py-10 text-center">
            <Star className="mx-auto h-8 w-8 text-border" />
            <p className="mt-2 font-medium text-foreground">No reviews yet</p>
            <p className="text-sm text-muted">
              Be the first to share your experience at this hotel.
            </p>
            {canWrite && (
              <Button variant="ghost" className="mt-3 h-9 px-4" onClick={handleCancel}>
                Write a review
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <div className="text-5xl font-bold text-foreground">{average.toFixed(1)}</div>
            <StarRating rating={Math.round(average)} size={16} className="mx-auto mt-1" />
            <p className="mt-2 text-sm text-muted">
              Average rating from {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="mb-3 text-sm font-medium text-foreground">Rating breakdown</p>
            {ratingCounts.map(({ stars, count }) => {
              const pct = reviews.length === 0 ? 0 : (count / reviews.length) * 100
              return (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-10 text-muted">{stars} star</span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-background-alt">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: pct + '%' }}
                    />
                  </div>
                  <span className="w-7 text-right text-muted">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Card className="mt-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          {isEditMode ? 'Edit your review' : 'Write your review'}
        </h3>
        {!canWrite ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <LogIn className="h-4 w-4" />
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
            <span>to write a review.</span>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-1">
              {[5, 4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setForm({ ...form, rating: stars })}
                  className="p-0.5"
                  aria-label={'Rate ' + stars + ' stars'}
                >
                  <Star
                    size={20}
                    className={
                      stars <= form.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-border'
                    }
                  />
                </button>
              ))}
            </div>
            <textarea
              className="input min-h-[90px] w-full resize-y"
              placeholder="Tell other travelers about your experience..."
              value={form.comment}
              maxLength={500}
              onChange={(e) =>
                setForm({ ...form, rating: form.rating, comment: e.target.value })
              }
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={handleCancel} disabled={reviewing}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={reviewing || !form.rating || form.comment.trim().length === 0}
              >
                {reviewing ? (
                  <>
                    <Loader2 size={16} className="mr-1 animate-spin" /> Saving…
                  </>
                ) : isEditMode ? (
                  <>
                    <Pencil size={16} className="mr-1" /> Save changes
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-1" /> Post review
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </Card>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {typeof error === 'string' ? error : error.message || 'Something went wrong'}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => {
            const isOwner = currentUser?.id === review.user?.id
            return (
              <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.user?.avatar || FALLBACK_AVATAR}
                      alt={review.user?.name || 'Guest'}
                      className="h-9 w-9 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_AVATAR
                      }}
                    />
                    <div>
                      <p className="font-semibold text-foreground">
                        {review.user?.name || 'Guest'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={review.rating} size={14} />
                        <span className="text-xs text-muted">
                          {fmtDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Edit"
                        onClick={() => startEdit(review)}
                        className="rounded-full p-1.5 text-muted hover:bg-background-alt hover:text-foreground"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => handleDelete(review.id)}
                        className="rounded-full p-1.5 text-muted hover:bg-background-alt hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-muted">{review.comment}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!canWrite && reviews.length > 0 && (
        <p className="mt-6 text-sm text-muted">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>{' '}
          to add a review.
        </p>
      )}
    </section>
  )
}
