import React, { useState, useEffect } from 'react'
import WnsContract from './WnsContract'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Initializing demo...')

  // Mock account for demo
  const mockAccount = {
    address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    meta: { name: 'Demo Account' }
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setStatus('Demo ready!')
      setLoading(false)
    }, 1500)
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="container">
          <h1>🌐 Nomenclature WNS</h1>
          <div className="loading">
            <div className="spinner"></div>
            <p>{status}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🌐 Nomenclature WNS</h1>
          <p className="subtitle">Web3 Naming Service Demo</p>
        </header>

        <div className="account-selector">
          <label>Demo Account:</label>
          <div style={{ 
            padding: '0.75rem', 
            background: 'rgba(255, 255, 255, 0.9)', 
            color: '#333', 
            borderRadius: '8px',
            fontFamily: 'monospace'
          }}>
            {mockAccount.meta.name} ({mockAccount.address.slice(0, 8)}...{mockAccount.address.slice(-8)})
          </div>
        </div>

        <div className="status">
          <span className="status-indicator connected"></span>
          <span>Demo Mode - Contract Ready</span>
        </div>

        <WnsContract 
          api={null}
          contract={null}
          account={mockAccount}
          contractAddress={'demo_contract_address'}
        />
      </div>
    </div>
  )
}

export default App