import React from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import TodoApp from './Screens/Todoapp'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<TodoApp/>} />
    </Routes>
  )
}

export default App