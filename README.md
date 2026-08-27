# UTEQ Smart Parking: vehículos y propietarios

<img src="public/captura.png">
Panel administrativo desarrollado con React, Vite y CoreUI para consultar y visualizar los vehículos autorizados del sistema UTEQ Smart Parking. La información se obtiene directamente desde Supabase.

## Práctica realizada

Se implementó la vista administrativa **Vehículos y propietarios**, accesible desde el menú lateral en:

```text
/parqueadero/vehiculos
```

La pantalla incluye:

- Consulta de la tabla `vehiculos` de Supabase.
- Fotografía del vehículo con enlace a la fuente original.
- Fotografía circular del propietario.
- Matrícula, marca, modelo, año y color.
- Nombre del propietario, cédula enmascarada y correo institucional.
- Estado de autorización del vehículo.
- Búsqueda por placa, marca, modelo, color, propietario o correo.
- Paginación de 10 registros por página.
- Indicador de carga y mensaje de error.
- Botón **Actualizar** para volver a consultar los datos.

La práctica se limita a la consulta y visualización. No se implementaron formularios CRUD, sensores, reconocimiento de placas, registro de entradas o salidas, Firebase ni autenticación.

## Lista de vehículos agregados

La aplicación presenta los **38 vehículos** registrados en Supabase. La lista se carga dinámicamente y se ordena por nombre del propietario, por lo que no se mantiene una copia duplicada de los registros dentro del frontend.

Cada vehículo consultado contiene los siguientes datos públicos:

| Dato | Descripción |
| --- | --- |
| `placa` | Matrícula del vehículo |
| `marca` | Marca del vehículo |
| `modelo` | Modelo del vehículo |
| `anio` | Año del vehículo |
| `color` | Color del vehículo |
| `tipo` | Tipo de vehículo |
| `foto_url` | Fotografía del vehículo |
| `foto_fuente_url` | Fuente de la fotografía |
| `foto_propietario_url` | Fotografía del propietario obtenida del SGA de la UTEQ |
| `cedula_enmascarada` | Cédula protegida para visualización |
| `propietario_nombre` | Nombre del propietario |
| `correo_institucional` | Correo institucional |
| `autorizado` | Estado de autorización |

La tabla muestra los 38 registros en cuatro páginas: 10 vehículos en las tres primeras páginas y 8 en la última, cuando no se aplica ningún filtro.

## Tecnologías utilizadas

- React 19
- Vite
- CoreUI React
- Supabase JavaScript Client
- Sass

## Configuración

Crear un archivo `.env.local` en la raíz del proyecto con las credenciales públicas del proyecto Supabase:

```dotenv
VITE_SUPABASE_URL=https://SU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SU_CLAVE
```

No se deben publicar `.env.local`, claves secretas ni claves `service_role`.

## Instalación y ejecución

```powershell
npm.cmd install
npm.cmd start
```

Abrir en el navegador:

```text
http://localhost:5173/parqueadero/vehiculos
```

Para generar la compilación de producción:

```powershell
npm.cmd run build
```

## Estructura principal

```text
src/
├── _nav.jsx                         # Opción lateral Parqueadero
├── routes.js                        # Ruta /parqueadero/vehiculos
├── hooks/
│   └── useVehiculos.js              # Consulta y recarga de Supabase
├── lib/
│   └── supabase.js                  # Cliente de Supabase
├── components/
│   ├── AppSidebar.jsx               # Logo del panel
│   └── ...
└── views/
	└── parqueadero/
		└── ListaVehiculos.jsx       # Tabla, búsqueda y paginación
```

## Verificación de la práctica

Con las variables de entorno configuradas y la tabla `vehiculos` disponible en Supabase, se debe comprobar que:

1. Se carguen los 38 vehículos.
2. Se visualicen las fotografías del vehículo y del propietario.
3. La cédula aparezca enmascarada.
4. La búsqueda filtre los campos indicados.
5. La paginación muestre 10 registros por página.
6. **Actualizar** vuelva a consultar Supabase.
7. No existan opciones ni formularios para insertar, modificar o eliminar vehículos.
