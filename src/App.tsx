import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Base from './pages/Base'
import Group from './pages/Group'
import Subtype from './pages/Subtype'
import Memory from './pages/Memory'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/memory" element={<Memory />} />
      <Route path="/base" element={<Base />} />
      <Route path="/base/:groupKey" element={<Group />} />
      <Route path="/base/:groupKey/:subtypeKey" element={<Subtype />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
