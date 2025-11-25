import { Routes, Route, Navigate } from 'react-router-dom'
import CrmLayout from './layouts/CrmLayout'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Pipelines from './pages/Pipelines'
import Automations from './pages/Automations'
import WorkflowBuilder from './pages/WorkflowBuilder'
import Funnels from './pages/Funnels'
import FunnelBuilder from './pages/FunnelBuilder'
import Messaging from './pages/Messaging'
import Settings from './pages/Settings'
import { useAuth } from '../../contexts/AuthContext'

const CrmApp = () => {
    const { userData, isAdmin } = useAuth()

    // Strict Role Check: Only Super Admin or Admin with CRM permissions
    // For now, we allow all 'admin' roles, but in production, check specific permissions
    if (!isAdmin) {
        return <Navigate to="/admin" replace />
    }

    return (
        <Routes>
            <Route element={<CrmLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="pipelines" element={<Pipelines />} />
                <Route path="automations" element={<Automations />} />
                <Route path="automations/:id" element={<WorkflowBuilder />} />
                <Route path="funnels" element={<Funnels />} />
                <Route path="funnels/:id" element={<FunnelBuilder />} />
                <Route path="messaging" element={<Messaging />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    )
}

export default CrmApp
