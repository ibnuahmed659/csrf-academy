import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Loader } from '@/components/ui/Loader'

const Home = lazy(() => import('@/routes/Home'))
const Learn = lazy(() => import('@/routes/Learn'))
const Chapter = lazy(() => import('@/routes/Chapter'))
const Tutorials = lazy(() => import('@/routes/Tutorials'))
const Tutorial = lazy(() => import('@/routes/Tutorial'))
const Cartoons = lazy(() => import('@/routes/Cartoons'))
const CartoonEpisode = lazy(() => import('@/routes/CartoonEpisode'))
const Labs = lazy(() => import('@/routes/Labs'))
const Lab = lazy(() => import('@/routes/Lab'))
const Playground = lazy(() => import('@/routes/Playground'))
const Certificate = lazy(() => import('@/routes/Certificate'))
const NotFound = lazy(() => import('@/routes/NotFound'))

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:slug" element={<Chapter />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorials/:id" element={<Tutorial />} />
          <Route path="/cartoons" element={<Cartoons />} />
          <Route path="/cartoons/:id" element={<CartoonEpisode />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/labs/:id" element={<Lab />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/certificate" element={<Certificate />} />
          <Route path="/chapters" element={<Navigate to="/learn" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
