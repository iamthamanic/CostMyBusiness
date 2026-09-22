/**
 * Application router.
 * Location: src/app/router.tsx
 */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/layouts/AppLayout'
import { OverviewPage } from '@/app/pages/OverviewPage'
import { StubPage } from '@/app/pages/StubPage'
import { ReposProvider } from '@/app/providers/ReposProvider'
import { BusinessesPage } from '@/features/businesses/ui/BusinessesPage'
import { ProductDetailPage } from '@/features/products/ui/ProductDetailPage'
import { ProductsPage } from '@/features/products/ui/ProductsPage'

export function AppRouter() {
  return (
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
            <Route path="templates" element={<StubPage title="Vorlagen" />} />
            <Route path="glossary" element={<StubPage title="Glossar" />} />
            <Route path="settings" element={<StubPage title="Einstellungen" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ReposProvider>
  )
}
