import { useState, useEffect } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState('연결 확인 중...')
  const [aiStatus, setAiStatus] = useState('연결 확인 중...')

  // 현재 브라우저가 접속한 호스트(IP 또는 도메인)를 가져옴
  const host = window.location.hostname;

  useEffect(() => {
    // Backend Check (Port 8080)
    fetch(`http://${host}:8080/api/health`)
      .then(res => res.text())
      .then(data => setBackendStatus(data))
      .catch(err => setBackendStatus('연결 실패 (Backend가 꺼져있거나 CORS 문제)'))

    // AI Engine Check (Port 5000)
    fetch(`http://${host}:5000`)
      .then(res => res.text())
      .then(data => setAiStatus(data))
      .catch(err => setAiStatus('연결 실패 (AI Engine이 꺼져있거나 CORS 문제)'))
  }, [host])

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#61dafb' }}>🚀 MaLangEE React Frontend</h1>
      <div style={{ marginTop: '30px', padding: '20px', background: '#f5f5f5', borderRadius: '10px' }}>
        <h3>시스템 상태 모니터링</h3>
        <p><strong>접속 호스트:</strong> {host}</p>
        <p><strong>Backend (Spring Boot):</strong> {backendStatus}</p>
        <p><strong>AI Engine (Python):</strong> {aiStatus}</p>
      </div>
    </div>
  )
}

export default App
