import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, Users, GitMerge, Workflow,
    Globe, MessageSquare, Settings, Menu, X,
    LogOut, Bell
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../../contexts/AuthContext'

const SidebarItem = ({ icon: Icon, label, path, active }) => (
    <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
            : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'text-neutral-400 group-hover:text-white'} />
        <span className="font-medium">{label}</span>
    </Link>
)

const CrmLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const location = useLocation()
    const { logout, userData } = useAuth()

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/crm' },
        { icon: Users, label: 'Contacts', path: '/crm/contacts' },
        { icon: GitMerge, label: 'Pipelines', path: '/crm/pipelines' },
        { icon: Workflow, label: 'Automations', path: '/crm/automations' },
        { icon: Globe, label: 'Sites & Funnels', path: '/crm/funnels' },
        { icon: MessageSquare, label: 'Messaging', path: '/crm/messaging' },
        { icon: Settings, label: 'Settings', path: '/crm/settings' },
    ]

    const isActive = (path) => {
        if (path === '/crm' && location.pathname === '/crm') return true
        if (path !== '/crm' && location.pathname.startsWith(path)) return true
        return false
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 flex overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
                className="bg-neutral-950 border-r border-neutral-800 flex-shrink-0 z-20 hidden md:flex flex-col"
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Workflow className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight text-white">TechSpurt</h1>
                        <p className="text-xs text-neutral-500 font-medium tracking-wider">CRM SUITE</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            active={isActive(item.path)}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <div className="bg-neutral-900 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-lg font-bold text-primary-500">
                            {userData?.displayName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{userData?.displayName || 'Admin'}</p>
                            <p className="text-xs text-neutral-500 truncate">{userData?.email}</p>
                        </div>
                        <button onClick={logout} className="text-neutral-400 hover:text-red-400 transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-neutral-900 relative">
                {/* Header */}
                <header className="h-16 bg-neutral-950/50 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between px-6 sticky top-0 z-10">
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-neutral-950"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CrmLayout
