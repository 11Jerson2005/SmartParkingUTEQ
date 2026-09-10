import React, { useState, useRef, useEffect } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CFormInput,
  CSpinner,
  CAlert,
  CTable,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCamera, cilSearch, cilWarning, cilCheckCircle } from '@coreui/icons'

const MonitoreoEntrada = () => {
  // --------------------------------------------------------
  // 1. ESTADOS DEL COMPONENTE
  // --------------------------------------------------------
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [imagenPrevia, setImagenPrevia] = useState(null)
  const [archivoParaEnviar, setArchivoParaEnviar] = useState(null)
  const [procesando, setProcesando] = useState(false)
  
  const [resultadoAPI, setResultadoAPI] = useState(null)
  const [errorAPI, setErrorAPI] = useState(null)

  // Referencias DOM
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // --------------------------------------------------------
  // 2. LÓGICA DE HARDWARE (CÁMARA Y ARCHIVOS)
  // --------------------------------------------------------
  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      streamRef.current = stream
      setCamaraActiva(true)
      setImagenPrevia(null)
      setArchivoParaEnviar(null)
      setResultadoAPI(null)
      setErrorAPI(null)
    } catch (error) {
      console.error('Error al acceder a la cámara:', error)
      setErrorAPI('No se pudo acceder a la cámara. Verifica permisos HTTPS.')
    }
  }

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCamaraActiva(false)
  }

  const capturarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      setArchivoParaEnviar(blob)
      setImagenPrevia(URL.createObjectURL(blob))
      detenerCamara()
    }, 'image/jpeg')
  }

  const manejarSeleccionArchivo = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrorAPI('Formato no admitido. Solo se permite JPG y PNG (Error 415 simulado).')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setErrorAPI('La imagen supera el límite de 4 MiB (Error 413 simulado).')
      return
    }

    setArchivoParaEnviar(file)
    setImagenPrevia(URL.createObjectURL(file))
    setResultadoAPI(null)
    setErrorAPI(null)
    detenerCamara()
  }

  // Liberar cámara al salir del componente
  useEffect(() => {
    return () => detenerCamara()
  }, [])

  // --------------------------------------------------------
  // 3. CONSUMO DEL ENDPOINT REST
  // --------------------------------------------------------
  const detectarPlaca = async () => {
    if (!archivoParaEnviar) return

    setProcesando(true)
    setErrorAPI(null)
    setResultadoAPI(null)

    try {
      const endpoint = import.meta.env.VITE_OCR_ENDPOINT
      if (!endpoint) throw new Error("Falta la variable de entorno VITE_OCR_ENDPOINT")

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': archivoParaEnviar.type || 'application/octet-stream',
        },
        body: archivoParaEnviar,
      })

      if (!response.ok) {
        if (response.status === 400) throw new Error("400: Imagen vacía, inválida o dimensiones no permitidas.")
        if (response.status === 413) throw new Error("413: La imagen es superior a 4 MiB.")
        if (response.status === 415) throw new Error("415: Formato no admitido.")
        if (response.status === 502) throw new Error("502: Fallo del servicio OCR o de Supabase.")
        if (response.status === 504) throw new Error("504: Tiempo de espera agotado.")
        throw new Error(`Error HTTP ${response.status}`)
      }

      const data = await response.json()
      setResultadoAPI(data)

    } catch (error) {
      setErrorAPI(error.message)
    } finally {
      setProcesando(false)
    }
  }

  // --------------------------------------------------------
  // 4. RENDERIZADO CONDICIONAL DE RESULTADOS
  // --------------------------------------------------------
  const renderResultados = () => {
    if (errorAPI) {
      return <CAlert color="danger"><CIcon icon={cilWarning} className="me-2"/>{errorAPI}</CAlert>
    }

    if (!resultadoAPI) {
      return <div className="text-center text-muted p-5 mt-4">Esperando imagen para procesar...</div>
    }

    // Preparar la imagen marcada desde Base64
    let imagenMarcadaSrc = null
    if (resultadoAPI.imagen_marcada?.base64) {
      imagenMarcadaSrc = `data:${resultadoAPI.imagen_marcada.mime_type};base64,${resultadoAPI.imagen_marcada.base64}`
    }

    const { estado, vehiculo, placa, confianza } = resultadoAPI

    return (
      <div className="mt-3">
        {/* Imagen Procesada */}
        {imagenMarcadaSrc && (
          <div className="mb-4 text-center">
            <h6 className="text-muted text-start mb-2">Imagen procesada</h6>
            <img src={imagenMarcadaSrc} alt="Vehículo detectado" className="img-fluid rounded border" style={{ maxHeight: '250px' }} />
          </div>
        )}

        {/* ALERTA: VEHÍCULO NO REGISTRADO */}
        {estado === 'no_registrado' && (
          <>
            <CAlert color="danger" className="text-center fs-5 fw-bold text-white" style={{ backgroundColor: '#dc3545', border: 'none' }}>
              <CIcon icon={cilWarning} size="xl" className="me-2 text-white" />
              VEHÍCULO NO REGISTRADO
            </CAlert>

            <CTable bordered hover responsive className="mb-4">
              <CTableBody>
                <CTableRow><CTableDataCell className="bg-light fw-semibold" style={{ width: '40%' }}>Placa detectada</CTableDataCell><CTableDataCell className="fw-bold">{placa || 'N/A'}</CTableDataCell></CTableRow>
                <CTableRow><CTableDataCell className="bg-light fw-semibold">Confianza OCR</CTableDataCell><CTableDataCell>{confianza ? `${(confianza * 100).toFixed(1)} %` : 'N/A'}</CTableDataCell></CTableRow>
                <CTableRow><CTableDataCell className="bg-light fw-semibold">Estado</CTableDataCell><CTableDataCell>{estado}</CTableDataCell></CTableRow>
                <CTableRow><CTableDataCell className="bg-light fw-semibold">Vehículo encontrado</CTableDataCell><CTableDataCell className="text-danger fw-bold">No</CTableDataCell></CTableRow>
              </CTableBody>
            </CTable>

            <CAlert color="danger" className="d-flex align-items-center">
              <CIcon icon={cilWarning} size="xl" className="me-3" />
              <div>
                <strong>Ingreso no autorizado</strong><br/>
                La placa no existe en la base de datos de Supabase.
              </div>
            </CAlert>
          </>
        )}

        {/* ALERTA: VEHÍCULO ENCONTRADO */}
        {estado === 'encontrado' && vehiculo && (
          <>
            <CAlert color="success" className="text-center fs-5 fw-bold text-white" style={{ backgroundColor: '#198754', border: 'none' }}>
              <CIcon icon={cilCheckCircle} size="xl" className="me-2 text-white" />
              INGRESO AUTORIZADO
            </CAlert>
            
            {/* NUEVO: Fotografías del vehículo y propietario (si la API las devuelve) */}
            <div className="d-flex justify-content-center gap-4 mb-3">
              {vehiculo.fotografia && (
                <div className="text-center">
                  <span className="small text-muted fw-bold d-block mb-1">Vehículo</span>
                  <img src={vehiculo.fotografia} alt="Vehículo" className="border rounded" style={{ height: '120px', width: '120px', objectFit: 'cover' }} />
                </div>
              )}
              {vehiculo.propietario && vehiculo.propietario.fotografia && (
                <div className="text-center">
                  <span className="small text-muted fw-bold d-block mb-1">Propietario</span>
                  <img src={vehiculo.propietario.fotografia} alt="Propietario" className="border rounded" style={{ height: '120px', width: '120px', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <CTable bordered hover responsive size="sm" className="mb-4">
              <CTableBody>
                <CTableRow><CTableDataCell className="bg-light fw-semibold" style={{ width: '40%' }}>Placa</CTableDataCell><CTableDataCell className="fw-bold">{placa}</CTableDataCell></CTableRow>
                <CTableRow><CTableDataCell className="bg-light fw-semibold">Confianza</CTableDataCell><CTableDataCell>{confianza ? `${(confianza * 100).toFixed(1)} %` : 'N/A'}</CTableDataCell></CTableRow>
                <CTableRow><CTableDataCell className="bg-light fw-semibold">Marca</CTableDataCell><CTableDataCell>{vehiculo.marca}</CTableDataCell></CTableRow>
                <CTableRow><CTableDataCell className="bg-light fw-semibold">Modelo</CTableDataCell><CTableDataCell>{vehiculo.modelo}</CTableDataCell></CTableRow>
                <CTableRow><CTableDataCell className="bg-light fw-semibold">Año</CTableDataCell><CTableDataCell>{vehiculo.anio}</CTableDataCell></CTableRow>
                <CTableRow><CTableDataCell className="bg-light fw-semibold">Color</CTableDataCell><CTableDataCell>{vehiculo.color}</CTableDataCell></CTableRow>
                <CTableRow><CTableDataCell className="bg-light fw-semibold">Tipo</CTableDataCell><CTableDataCell>{vehiculo.tipo}</CTableDataCell></CTableRow>
                
                {/* Datos del Propietario */}
                {vehiculo.propietario && (
                  <>
                    <CTableRow><CTableDataCell className="bg-light fw-semibold">Propietario</CTableDataCell><CTableDataCell>{vehiculo.propietario.nombre}</CTableDataCell></CTableRow>
                    <CTableRow><CTableDataCell className="bg-light fw-semibold">Cédula</CTableDataCell><CTableDataCell>{vehiculo.propietario.cedula_enmascarada}</CTableDataCell></CTableRow>
                    <CTableRow><CTableDataCell className="bg-light fw-semibold">Autorización</CTableDataCell><CTableDataCell><CBadge color="success">Autorizado</CBadge></CTableDataCell></CTableRow>
                  </>
                )}
              </CTableBody>
            </CTable>
          </>
        )}

        {/* OTROS ESTADOS: sin_placa, baja_confianza, multiples_placas */}
        {['sin_placa', 'baja_confianza', 'multiples_placas'].includes(estado) && (
          <CAlert color="warning" className="d-flex align-items-center mt-3">
             <CIcon icon={cilWarning} size="xl" className="me-3" />
             <div>
               <strong>Atención: {estado.replace('_', ' ').toUpperCase()}</strong><br/>
               Por favor, intente capturar la imagen nuevamente asegurándose de que la placa sea visible.
             </div>
          </CAlert>
        )}

        <CAlert color="success" className="d-flex align-items-center mt-4 mb-0 py-2">
          <CIcon icon={cilCheckCircle} size="lg" className="me-2" />
          <div style={{ fontSize: '0.85rem' }}>
            <strong>API REST</strong><br/>Respuesta recibida correctamente
          </div>
        </CAlert>
      </div>
    )
  }

  // --------------------------------------------------------
  // VISTA PRINCIPAL
  // --------------------------------------------------------
  return (
    <CRow>
      {/* PARTE IZQUIERDA: CAPTURA DEL VEHÍCULO */}
      <CCol md={6}>
        <CCard className="mb-4 h-100">
          <CCardHeader>
            <strong>Captura de vehículo</strong>
          </CCardHeader>
          <CCardBody className="d-flex flex-column">
            
            <div className="d-flex flex-column align-items-center mb-4">
              {!imagenPrevia ? (
                <div style={{ width: '100%', minHeight: '220px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: camaraActiva ? 'block' : 'none' }} />
                  {!camaraActiva && <span className="text-white">Cámara inactiva</span>}
                </div>
              ) : (
                <img src={imagenPrevia} alt="Vista previa" style={{ width: '100%', borderRadius: '8px' }} />
              )}
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

            <div className="d-flex gap-2 justify-content-center mb-4">
              {!camaraActiva && !imagenPrevia && (
                <CButton color="primary" onClick={iniciarCamara}>
                  <CIcon icon={cilCamera} className="me-2" /> Activar Cámara
                </CButton>
              )}
              {camaraActiva && (
                <>
                  <CButton color="success" onClick={capturarFoto} className="text-white">Capturar</CButton>
                  <CButton color="danger" onClick={detenerCamara} className="text-white">Detener</CButton>
                </>
              )}
              {imagenPrevia && (
                <CButton color="secondary" onClick={() => {
                  setImagenPrevia(null)
                  setArchivoParaEnviar(null)
                  setResultadoAPI(null)
                  iniciarCamara()
                }}>
                  <CIcon icon={cilCamera} className="me-2" /> Nueva captura
                </CButton>
              )}
            </div>

            <hr className="mt-auto mb-4" />

            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">O selecciona una imagen del dispositivo:</label>
              <CFormInput type="file" accept="image/jpeg, image/png" onChange={manejarSeleccionArchivo} />
            </div>

            <CButton 
              color="dark" 
              className="w-100 mt-auto" 
              size="lg"
              disabled={!archivoParaEnviar || procesando}
              onClick={detectarPlaca}
            >
              {procesando ? (
                <><CSpinner size="sm" className="me-2"/> Procesando en Supabase...</>
              ) : (
                <><CIcon icon={cilSearch} className="me-2" /> Detectar Placa</>
              )}
            </CButton>

          </CCardBody>
        </CCard>
      </CCol>

      {/* PARTE DERECHA: RESULTADOS */}
      <CCol md={6}>
        <CCard className="h-100">
          <CCardHeader>
            <strong>Resultado del reconocimiento</strong>
          </CCardHeader>
          <CCardBody>
            {renderResultados()}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MonitoreoEntrada