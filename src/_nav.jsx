import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBug,
  cilCalculator,
  cilChartPie,
  cilDescription,
  cilExternalLink,
  cilLockLocked,
  cilNotes,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilCarAlt,
  cilCamera // <-- Agregamos el ícono de la cámara
} from '@coreui/icons'

import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Parqueadero',
  },
  {
    component: CNavItem,
    name: 'Vehículos y propietarios',
    to: '/parqueadero/vehiculos',
    icon: <CIcon icon={cilCarAlt} customClassName="nav-icon" />,
  },
  // <-- NUESTRO NUEVO MENÚ EMPIEZA AQUÍ -->
  {
    component: CNavItem,
    name: 'Monitoreo de entrada',
    to: '/parqueadero/monitoreo-entrada',
    icon: <CIcon icon={cilCamera} customClassName="nav-icon" />,
  }
  // <-- TERMINA AQUÍ -->
]

export default _nav