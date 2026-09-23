/**
 * Product deep-link → calculator home with ?p=
 * Location: src/features/products/ui/ProductDetailPage.tsx
 */
import { Navigate, useParams } from 'react-router-dom'

export function ProductDetailPage() {
  const { productId } = useParams()
  if (!productId) return <Navigate to="/" replace />
  return <Navigate to={`/?p=${encodeURIComponent(productId)}`} replace />
}
