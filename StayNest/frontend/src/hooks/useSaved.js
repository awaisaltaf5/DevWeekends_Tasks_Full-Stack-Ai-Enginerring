import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { saveHotel, removeSaved } from '../features/saved/savedSlice'

/**
 * Shared hook for the save/unsave heart button used on hotel cards and the
 * hotel detail page. Provides optimistic-ish state lookups plus a toggle that
 * redirects unauthenticated users to the login page (preserving the current
 * location so they can return after signing in).
 */
export default function useSaved() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { savedIds, savingId } = useSelector((s) => s.saved)
  const token = useSelector((s) => s.auth.token)

  const isSaved = (hotelId) => savedIds.some((savedId) => String(savedId) === String(hotelId))
  const isSaving = (hotelId) => String(savingId) === String(hotelId)

  const toggleSave = (hotelId) => {
    if (!token) {
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }
    if (isSaved(hotelId)) dispatch(removeSaved(hotelId))
    else dispatch(saveHotel(hotelId))
  }

  return { isSaved, isSaving, toggleSave }
}
