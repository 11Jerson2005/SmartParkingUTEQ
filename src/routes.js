import React from 'react'

// Dashboard
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const ListaVehiculos = React.lazy(
  () => import('./views/parqueadero/ListaVehiculos'),
)

// <-- NUESTRA NUEVA VISTA EMPIEZA AQUÍ -->
const MonitoreoEntrada = React.lazy(
  () => import('./views/parqueadero/MonitoreoEntrada'),
)
// <-- TERMINA AQUÍ -->

export const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/parqueadero/vehiculos', name: 'Vehículos y propietarios', element: ListaVehiculos },
  // <-- NUESTRA NUEVA RUTA EMPIEZA AQUÍ -->
  { path: '/parqueadero/monitoreo-entrada', name: 'Monitoreo de entrada', element: MonitoreoEntrada },
  // <-- TERMINA AQUÍ -->
]

export default routes