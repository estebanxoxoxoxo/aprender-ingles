import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Base from './pages/Base'
import Group from './pages/Group'
import Subtype from './pages/Subtype'
import Unit from './pages/Unit'
import Memory from './pages/Memory'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/memory" element={<Memory />} />
      <Route path="/base" element={<Base />} />
      <Route path="/base/:groupKey" element={<Group />} />
      <Route path="/base/:groupKey/:secondKey" element={<Subtype />} />
      <Route path="/base/:groupKey/:subtypeKey/:unitKey" element={<Unit />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
