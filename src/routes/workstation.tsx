import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from '@/pages/auth/Login'

const WorkstationRoutes = () => (
  <Routes>
    <Route path="/workstation/login" element={<Login role="admin" />} />
  </Routes>
)

export default WorkstationRoutes



