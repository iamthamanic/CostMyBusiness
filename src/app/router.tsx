/**
 * Application router.
 * Location: src/app/router.tsx
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import { OverviewPage } from '@/app/pages/OverviewPage'
import { StubPage } from '@/app/pages/StubPage'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { ReposProvider } from '@/app/providers/ReposProvider'
import { AuthPage } from '@/features/auth'
import { BusinessesPage } from '@/features/businesses/ui/BusinessesPage'
import { GlossaryPage } from '@/features/glossary'
import { ProductDetailPage } from '@/features/products/ui/ProductDetailPage'
import { ProductsPage } from '@/features/products/ui/ProductsPage'
import { TemplatesPage } from '@/features/templates'

export function AppRouter() {
  return (
    <AuthProvider>
      <ReposProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="businesses" element={<BusinessesPage />} />
              <Route path="businesses/:businessId/products" element={<ProductsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:productId" element={<ProductDetailPage />} />
              <Route path="scenarios" element={<StubPage title="Szenarien" />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="glossary" element={<GlossaryPage />} />
              <Route path="auth" element={<AuthPage />} />
              <Route path="settings" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ReposProvider>
    </AuthProvider>
  )
}
