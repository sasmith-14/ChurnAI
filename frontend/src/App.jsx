import { useState } from 'react'

/* ==============================
   Circular Gauge Component
   ============================== */
function ChurnGauge({ probability }) {
  const percentage = Math.round(probability * 100)
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (probability * circumference)

  let color = '#22c55e'
  if (probability > 0.7) color = '#ef4444'
  else if (probability > 0.3) color = '#eab308'

  let riskLevel = 'Low Risk'
  let riskClass = 'risk-low'
  if (probability > 0.7) { riskLevel = 'High Risk'; riskClass = 'risk-high' }
  else if (probability > 0.3) { riskLevel = 'Medium Risk'; riskClass = 'risk-medium' }

  return (
    <div className="gauge-container">
      <div style={{ position: 'relative', width: '150px', height: '150px' }}>
        <svg className="gauge-ring" width="150" height="150" viewBox="0 0 150 150">
          <circle className="gauge-track" cx="75" cy="75" r={radius} />
          <circle
            className="gauge-fill"
            cx="75" cy="75" r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color, lineHeight: 1 }}>
            {percentage}%
          </span>
          <span style={{ fontSize: '0.65rem', color: '#7a7a8e', marginTop: '4px' }}>
            churn risk
          </span>
        </div>
      </div>
      <div className={`risk-badge ${riskClass}`}>
        <span className="pulse-dot" style={{ background: color }}></span>
        {riskLevel}
      </div>
    </div>
  )
}

/* ==============================
   Main App Component
   ============================== */
function App() {
  const [formData, setFormData] = useState({
    gender: 'Female',
    SeniorCitizen: 0,
    Partner: 'Yes',
    Dependents: 'No',
    tenure: 12,
    PhoneService: 'No',
    MultipleLines: 'No phone service',
    InternetService: 'DSL',
    OnlineSecurity: 'No',
    OnlineBackup: 'Yes',
    DeviceProtection: 'No',
    TechSupport: 'No',
    StreamingTV: 'No',
    StreamingMovies: 'No',
    Contract: 'Month-to-month',
    PaperlessBilling: 'Yes',
    PaymentMethod: 'Electronic check',
    MonthlyCharges: 50.00,
    TotalCharges: 600.00,
  })

  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Server error')
      const data = await response.json()
      setPrediction(data.churn_probability)

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        tenure: formData.tenure,
        charges: formData.MonthlyCharges,
        contract: formData.Contract,
        risk: data.churn_probability,
      }, ...prev].slice(0, 5))
    } catch (err) {
      setError('Could not reach the server. Is the backend running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskLabel = (prob) => {
    if (prob > 0.7) return { text: 'High', color: '#ef4444' }
    if (prob > 0.3) return { text: 'Medium', color: '#eab308' }
    return { text: 'Low', color: '#22c55e' }
  }

  const SelectField = ({ label, id, options, isInt = false }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <select
        id={id}
        className="form-input"
        value={formData[id]}
        onChange={(e) => handleChange(id, isInt ? parseInt(e.target.value) : e.target.value)}
        style={{ cursor: 'pointer' }}
      >
        {options.map(opt => {
          const value = typeof opt === 'object' ? opt.value : opt;
          const text = typeof opt === 'object' ? opt.label : opt;
          return <option key={value} value={value}>{text}</option>;
        })}
      </select>
    </div>
  )

  return (
    <div className="app-layout">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">C</div>
          <div className="sidebar-logo-text">Churn<span>AI</span></div>
        </div>
        <div className="sidebar-section-label">Menu</div>
        <nav className="sidebar-nav">
          <a className="sidebar-link active" href="#">
            Predict
          </a>
          <a className="sidebar-link" href="#">
            History
          </a>
          <a className="sidebar-link" href="#">
            Settings
          </a>
        </nav>
        <div className="sidebar-section-label">Model</div>
        <nav className="sidebar-nav">
          <a className="sidebar-link" href="#">
            Model Info
          </a>
          <a className="sidebar-link" href="#">
            Performance
          </a>
        </nav>
        {/* Server Status */}
        <div className="sidebar-status">
          <span style={{ fontSize: '0.78rem', color: '#7a7a8e' }}>
            <span className="sidebar-status-dot"></span>
            API Server Online
          </span>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <div>
            <div className="topbar-breadcrumb">Dashboard → <span>Predict</span></div>
            <h1 className="topbar-title">Churn Prediction</h1>
            <p className="topbar-subtitle">Analyze customer risk of churning in real-time</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-outline">Export Data</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-row">
          <div className="summary-card">
            <div className="summary-card-label">Total Predictions</div>
            <div className="summary-card-value"><span>{history.length}</span></div>
            <div className="summary-card-sub">This session</div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">Latest Risk</div>
            <div className="summary-card-value">
              {prediction !== null
                ? <span>{Math.round(prediction * 100)}%</span>
                : <span style={{ color: '#55556a' }}>—</span>
              }
            </div>
            <div className="summary-card-sub">
              {prediction !== null ? getRiskLabel(prediction).text + ' Risk' : 'No prediction yet'}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-card-label">High Risk Count</div>
            <div className="summary-card-value">
              <span>{history.filter(h => h.risk > 0.7).length}</span>
            </div>
            <div className="summary-card-sub">Customers flagged</div>
          </div>
        </div>

        {/* Main Grid: Form + Result */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: prediction !== null ? '1fr 1fr' : '1fr',
          gap: '20px',
          marginBottom: '28px',
        }}>
          {/* Form Card */}
          <div className="card" style={{ padding: '28px' }}>
            <h2 style={{
              fontSize: '0.95rem', fontWeight: 600, marginBottom: '22px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              Customer Details
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                
                {/* Demographics */}
                <h3 className="form-group full-width" style={{color: '#7a7a8e', fontSize: '0.75rem', marginTop: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #2a2a35', paddingBottom: '6px'}}>Demographics</h3>
                <SelectField id="gender" label="Gender" options={['Male', 'Female']} />
                <SelectField id="SeniorCitizen" label="Senior Citizen" options={[{label: 'Yes', value: 1}, {label: 'No', value: 0}]} isInt={true} />
                <SelectField id="Partner" label="Partner" options={['Yes', 'No']} />
                <SelectField id="Dependents" label="Dependents" options={['Yes', 'No']} />

                {/* Account Info */}
                <h3 className="form-group full-width" style={{color: '#7a7a8e', fontSize: '0.75rem', marginTop: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #2a2a35', paddingBottom: '6px'}}>Account Info</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="tenure">Tenure (months)</label>
                  <input id="tenure" className="form-input" type="number" min="0" value={formData.tenure} onChange={(e) => handleChange('tenure', parseInt(e.target.value) || 0)} />
                </div>
                <SelectField id="Contract" label="Contract Type" options={['Month-to-month', 'One year', 'Two year']} />
                <SelectField id="PaperlessBilling" label="Paperless Billing" options={['Yes', 'No']} />
                <SelectField id="PaymentMethod" label="Payment Method" options={['Electronic check', 'Mailed check', 'Bank transfer (automatic)', 'Credit card (automatic)']} />
                
                <div className="form-group">
                  <label className="form-label" htmlFor="MonthlyCharges">Monthly Charges ($)</label>
                  <input id="MonthlyCharges" className="form-input" type="number" step="0.01" value={formData.MonthlyCharges} onChange={(e) => handleChange('MonthlyCharges', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="TotalCharges">Total Charges ($)</label>
                  <input id="TotalCharges" className="form-input" type="number" step="0.01" value={formData.TotalCharges} onChange={(e) => handleChange('TotalCharges', parseFloat(e.target.value) || 0)} />
                </div>

                {/* Services */}
                <h3 className="form-group full-width" style={{color: '#7a7a8e', fontSize: '0.75rem', marginTop: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #2a2a35', paddingBottom: '6px'}}>Services</h3>
                <SelectField id="PhoneService" label="Phone Service" options={['Yes', 'No']} />
                <SelectField id="MultipleLines" label="Multiple Lines" options={['Yes', 'No', 'No phone service']} />
                <SelectField id="InternetService" label="Internet Service" options={['DSL', 'Fiber optic', 'No']} />
                <SelectField id="OnlineSecurity" label="Online Security" options={['Yes', 'No', 'No internet service']} />
                <SelectField id="OnlineBackup" label="Online Backup" options={['Yes', 'No', 'No internet service']} />
                <SelectField id="DeviceProtection" label="Device Protection" options={['Yes', 'No', 'No internet service']} />
                <SelectField id="TechSupport" label="Tech Support" options={['Yes', 'No', 'No internet service']} />
                <SelectField id="StreamingTV" label="Streaming TV" options={['Yes', 'No', 'No internet service']} />
                <SelectField id="StreamingMovies" label="Streaming Movies" options={['Yes', 'No', 'No internet service']} />

                {/* Submit */}
                <div className="form-group full-width" style={{ marginTop: '16px' }}>
                  <button type="submit" className="btn-predict" disabled={loading}>
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <span className="spinner"></span> Analyzing...
                      </span>
                    ) : (
                      'Predict Churn Risk'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.82rem', textAlign: 'center', marginTop: '14px' }}>
                  {error}
                </p>
              )}
            </form>
          </div>

          {/* Result Card */}
          {prediction !== null && (
            <div className="card result-section" style={{
              padding: '28px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <h2 style={{
                fontSize: '0.95rem', fontWeight: 600, marginBottom: '24px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                Prediction Result
              </h2>

              <ChurnGauge probability={prediction} />

              <p style={{
                color: '#7a7a8e', fontSize: '0.82rem', textAlign: 'center',
                marginTop: '22px', lineHeight: 1.6, maxWidth: '300px',
              }}>
                {prediction > 0.7
                  ? 'This customer is at high risk of churning. Consider offering retention incentives or personalized engagement.'
                  : prediction > 0.3
                  ? 'This customer shows moderate churn signals. Monitor engagement and usage closely.'
                  : 'This customer appears stable with low churn risk. Continue standard service delivery.'}
              </p>
            </div>
          )}
        </div>

        {/* History Table */}
        {history.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '18px 22px',
              borderBottom: '1px solid #2a2a35',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                Recent Predictions ({history.length})
              </h2>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tenure</th>
                  <th>Monthly Charges</th>
                  <th>Contract</th>
                  <th>Churn Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => {
                  const risk = getRiskLabel(entry.risk)
                  return (
                    <tr key={entry.id}>
                      <td>{entry.tenure} months</td>
                      <td className="highlight">${entry.charges.toFixed(2)}</td>
                      <td>{entry.contract}</td>
                      <td className="highlight">{Math.round(entry.risk * 100)}%</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '0.78rem', fontWeight: 600, color: risk.color,
                        }}>
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: risk.color,
                          }}></span>
                          {risk.text} Risk
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <footer style={{
          textAlign: 'center', marginTop: '48px', paddingBottom: '20px',
          color: '#55556a', fontSize: '0.7rem',
        }}>
          ChurnAI 2026. All Rights Reserved. — Powered by FastAPI & React
        </footer>
      </main>
    </div>
  )
}

export default App
