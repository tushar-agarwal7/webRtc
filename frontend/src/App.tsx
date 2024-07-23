import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Sender from './component/Sender'
import Reciever from './component/Reciever'

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path='/sender' element={<Sender/>} />
      <Route path='/reciever' element={<Reciever/>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
