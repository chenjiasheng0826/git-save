import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import StatusBar from './components/StatusBar'
import ToastContainer from './components/Toast'
import ProjectList from './pages/ProjectList'
import SaveTimeline from './pages/SaveTimeline'
import SaveDetail from './pages/SaveDetail'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-surface-50 p-6">
          <div className="animate-fadeIn">
            <Routes>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/timeline" element={<SaveTimeline />} />
              <Route path="/timeline/:saveId" element={<SaveDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
        <StatusBar />
      </div>
      <ToastContainer />
    </div>
  )
}
