import { useState, useRef } from 'react'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  
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
    // Check if it's an image
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
      // In production, replace this with your AWS backend URL
      // e.g. const API_URL = import.meta.env.VITE_API_URL || 'http://your-aws-ec2-ip:8000';
      const API_URL = 'http://localhost:8000'; 
      
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

  return (
    <div className="container">
      <h1>Paddy Disease AI</h1>
      <p className="subtitle">Upload a leaf image for instant VGG16-powered diagnosis</p>
      
      <div className="card">
        {!previewUrl ? (
          <div 
            className={`upload-area ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
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
                <div className="result-title">Diagnosis Result</div>
                <div className="result-class">{result.prediction}</div>
                <div className="result-confidence">Confidence: {result.confidence.toFixed(2)}%</div>
              </div>
            ) : (
              <div style={{display: 'flex', gap: '1rem'}}>
                 <button 
                  className="btn" 
                  style={{backgroundColor: '#475569'}} 
                  onClick={resetSelection}
                  disabled={loading}
                >
                  Choose Another
                </button>
                <button 
                  className={`btn ${loading ? 'loading' : ''}`} 
                  onClick={handleUpload}
                  disabled={loading}
                >
                  {loading ? 'Analyzing Image...' : 'Analyze Disease'}
                </button>
              </div>
            )}
            
            {result && (
              <button className="btn" onClick={resetSelection} style={{marginTop: '1.5rem'}}>
                Analyze Another Image
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
