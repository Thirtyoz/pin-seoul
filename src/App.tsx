import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginTest from './LoginTest'
import Home from './Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginTest />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
