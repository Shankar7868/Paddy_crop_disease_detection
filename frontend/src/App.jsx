import { useState, useRef } from 'react'
import heroImg from './assets/paddy_3d_hero.jpg'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' })
  
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (file) => {
    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)')
      return
    }
    
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; 
      
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (err) {
      console.error('Error during prediction:', err)
      setError('Failed to get prediction. Please ensure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  const resetSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    
    const x = (clientX - left) / width
    const y = (clientY - top) / height
    
    const rotateX = (y - 0.5) * -30 // Max 30 deg rotation
    const rotateY = (x - 0.5) * 30
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`
    })
  }

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    })
  }

  const handleMouseEnter = () => {
    setTiltStyle((prev) => ({
      ...prev,
      transition: 'none' // Remove transition for smooth tracking
    }))
  }

  return (
    <div className="layout">
      {/* Background decorations */}
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      
      {/* Navigation */}
      <nav className="nav">
        <div className="logo">🌱 PaddyAI</div>
        <div className="nav-links">
          <span>Home</span>
          <span>About Model</span>
          <span>Contact</span>
        </div>
      </nav>

      {/* Main Content Split */}
      <main className="main-content">
        
        {/* Left Side: Text and Uploader */}
        <div className="content-left">
          <h1>Next-Gen Paddy<br/><span className="gradient-text">Disease Diagnosis</span></h1>
          <p className="subtitle">Harness the power of a VGG16 Deep Learning model to instantly detect Bacterial Blight, Blast, Brown Spot, and Tungro. Upload a leaf image below to begin analysis.</p>
          
          <div className="card">
            {!previewUrl ? (
              <div 
                className={`upload-area ${isDragging ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon-wrapper">
                  <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <div className="upload-text">Drag & drop your image here</div>
                <div className="upload-subtext">or click to browse from your device</div>
                <input 
                  type="file" 
                  className="file-input" 
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  accept="image/*"
                />
              </div>
            ) : (
              <div className="preview-container">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                
                {result ? (
                  <div className="result-card">
                    <div className="result-title">AI Diagnosis Result</div>
                    <div className="result-class">{result.prediction}</div>
                    <div className="result-confidence">
                      <div className="confidence-bar-bg">
                        <div className="confidence-bar-fill" style={{width: `${result.confidence}%`}}></div>
                      </div>
                      <span>Confidence: {result.confidence.toFixed(2)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="action-buttons">
                     <button 
                      className="btn btn-secondary" 
                      onClick={resetSelection}
                      disabled={loading}
                    >
                      Choose Another
                    </button>
                    <button 
                      className={`btn btn-primary ${loading ? 'loading' : ''}`} 
                      onClick={handleUpload}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner"></span> Analyzing...
                        </>
                      ) : 'Analyze Disease'}
                    </button>
                  </div>
                )}
                
                {result && (
                  <button className="btn btn-primary" onClick={resetSelection} style={{marginTop: '1.5rem', width: '100%'}}>
                    Analyze Another Image
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="error-message">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: 3D Floating Hero */}
        <div className="content-right">
          <div className="hero-3d-container">
            <div className="glow-ring"></div>
            <img 
              src={heroImg} 
              alt="3D Paddy Crop AI Analysis" 
              className="hero-3d-image"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
              style={tiltStyle}
            />
            {/* Floating tech badges */}
            <div className="floating-badge badge-1">🧠 VGG16 Powered</div>
            <div className="floating-badge badge-2">⚡ Real-time Inference</div>
            <div className="floating-badge badge-3">🎯 99% Precision</div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default App
