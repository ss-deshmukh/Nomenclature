import React, { useState } from 'react'
import { web3FromSource } from '@polkadot/extension-dapp'

function WnsContract({ api, contract, account, contractAddress }) {
  const [activeTab, setActiveTab] = useState('register')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [resultType, setResultType] = useState('')

  // Form states
  const [registerName, setRegisterName] = useState('')
  const [registerAddress, setRegisterAddress] = useState('')
  const [resolveName, setResolveName] = useState('')
  const [updateName, setUpdateName] = useState('')
  const [updateAddress, setUpdateAddress] = useState('')

  const showResult = (message, type = 'success') => {
    setResult(message)
    setResultType(type)
    setTimeout(() => {
      setResult('')
      setResultType('')
    }, 5000)
  }

  const handleRegisterName = async (e) => {
    e.preventDefault()
    if (!registerName || !registerAddress) {
      showResult('Please fill in both name and address', 'error')
      return
    }

    setLoading(true)
    try {
      // For demo purposes, we'll simulate the contract interaction
      if (!contract) {
        // Mock success for demo
        showResult(`Successfully registered ${registerName}.web3 → ${registerAddress}`, 'success')
        setRegisterName('')
        setRegisterAddress('')
        setLoading(false)
        return
      }

      const injector = await web3FromSource(account.meta.source)
      
      // Call the register_name function
      const gasLimit = api.registry.createType('WeightV2', {
        refTime: 3000000000,
        proofSize: 131072,
      })
      
      await contract.tx.registerName(
        { gasLimit, storageDepositLimit: null },
        registerName,
        registerAddress
      ).signAndSend(account.address, { signer: injector.signer }, (result) => {
        if (result.status.isInBlock) {
          showResult(`Successfully registered ${registerName}.web3!`, 'success')
          setRegisterName('')
          setRegisterAddress('')
        } else if (result.status.isFinalized) {
          console.log('Transaction finalized')
        }
      })
    } catch (error) {
      showResult(`Error: ${error.message}`, 'error')
    }
    setLoading(false)
  }

  const handleResolveName = async (e) => {
    e.preventDefault()
    if (!resolveName) {
      showResult('Please enter a name to resolve', 'error')
      return
    }

    setLoading(true)
    try {
      if (!contract) {
        // Mock response for demo
        const mockAddresses = {
          'alice.web3': '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
          'bob.web3': '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        }
        
        const address = mockAddresses[resolveName]
        if (address) {
          showResult(`${resolveName} resolves to: ${address}`, 'success')
        } else {
          showResult(`Name ${resolveName} not found`, 'error')
        }
        setLoading(false)
        return
      }

      // Call the resolve_name function
      const { result, output } = await contract.query.resolveName(
        account.address,
        { gasLimit: -1, storageDepositLimit: null },
        resolveName
      )

      if (result.isOk) {
        const address = output.toHuman()
        showResult(`${resolveName} resolves to: ${address}`, 'success')
      } else {
        showResult(`Name ${resolveName} not found`, 'error')
      }
    } catch (error) {
      showResult(`Error: ${error.message}`, 'error')
    }
    setLoading(false)
  }

  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    if (!updateName || !updateAddress) {
      showResult('Please fill in both name and new address', 'error')
      return
    }

    setLoading(true)
    try {
      if (!contract) {
        // Mock success for demo
        showResult(`Successfully updated ${updateName}.web3 to ${updateAddress}`, 'success')
        setUpdateName('')
        setUpdateAddress('')
        setLoading(false)
        return
      }

      const injector = await web3FromSource(account.meta.source)
      
      const gasLimit = api.registry.createType('WeightV2', {
        refTime: 3000000000,
        proofSize: 131072,
      })
      
      await contract.tx.updateAddress(
        { gasLimit, storageDepositLimit: null },
        updateName,
        updateAddress
      ).signAndSend(account.address, { signer: injector.signer }, (result) => {
        if (result.status.isInBlock) {
          showResult(`Successfully updated ${updateName}.web3!`, 'success')
          setUpdateName('')
          setUpdateAddress('')
        }
      })
    } catch (error) {
      showResult(`Error: ${error.message}`, 'error')
    }
    setLoading(false)
  }

  if (!account) {
    return (
      <div className="wns-container">
        <p>Please connect your wallet to use Nomenclature WNS.</p>
      </div>
    )
  }

  return (
    <div className="wns-container">
      <div className="tabs">
        <div 
          className={`tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Register Name
        </div>
        <div 
          className={`tab ${activeTab === 'resolve' ? 'active' : ''}`}
          onClick={() => setActiveTab('resolve')}
        >
          Resolve Name
        </div>
        <div 
          className={`tab ${activeTab === 'update' ? 'active' : ''}`}
          onClick={() => setActiveTab('update')}
        >
          Update Address
        </div>
      </div>

      {!contract && (
        <div className="section">
          <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '2rem' }}>
            <strong>Demo Mode:</strong> Contract not deployed yet. This demonstrates the UI functionality.
          </p>
        </div>
      )}

      {activeTab === 'register' && (
        <div className="section">
          <h3>Register New .web3 Name</h3>
          <form onSubmit={handleRegisterName}>
            <div className="form-group">
              <label>Name (without .web3 suffix):</label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="alice"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input
                type="text"
                value={registerAddress}
                onChange={(e) => setRegisterAddress(e.target.value)}
                placeholder="5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
                disabled={loading}
              />
            </div>
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Registering...' : 'Register Name'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'resolve' && (
        <div className="section">
          <h3>Resolve .web3 Name</h3>
          <form onSubmit={handleResolveName}>
            <div className="form-group">
              <label>Name to resolve:</label>
              <input
                type="text"
                value={resolveName}
                onChange={(e) => setResolveName(e.target.value)}
                placeholder="alice.web3"
                disabled={loading}
              />
            </div>
            <button type="submit" className="button secondary" disabled={loading}>
              {loading ? 'Resolving...' : 'Resolve Name'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'update' && (
        <div className="section">
          <h3>Update Address for Existing Name</h3>
          <form onSubmit={handleUpdateAddress}>
            <div className="form-group">
              <label>Name (without .web3 suffix):</label>
              <input
                type="text"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                placeholder="alice"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>New Address:</label>
              <input
                type="text"
                value={updateAddress}
                onChange={(e) => setUpdateAddress(e.target.value)}
                placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                disabled={loading}
              />
            </div>
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Updating...' : 'Update Address'}
            </button>
          </form>
        </div>
      )}

      {result && (
        <div className={`result ${resultType}`}>
          {result}
        </div>
      )}

      <div className="section" style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '2rem' }}>
        <h3>Demo Features</h3>
        <ul style={{ opacity: 0.8 }}>
          <li><strong>Register:</strong> Create a new .web3 name mapping to any blockchain address</li>
          <li><strong>Resolve:</strong> Look up the address associated with a .web3 name</li>
          <li><strong>Update:</strong> Change the address for names you own</li>
          <li><strong>Cross-chain:</strong> Works with any blockchain address format</li>
        </ul>
      </div>
    </div>
  )
}

export default WnsContract