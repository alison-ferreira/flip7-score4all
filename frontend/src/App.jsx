import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RoomController from './pages/RoomController'
import RoomViewer from './pages/RoomViewer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:code/controller" element={<RoomController />} />
        <Route path="/room/:code" element={<RoomViewer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
