/**
 * AdminLayout.tsx
 * 
 * Main admin panel layout with responsive sidebar navigation.
 * 
 * Features:
 * - Collapsible sidebar
 * - Mobile responsive
 * - User dropdown
 * - Breadcrumbs
 * - Notification bell
 * 
 * @module layouts/AdminLayout
 */

import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Users,
    GraduationCap,
    Award,
    Briefcase,
    Image,
    Settings,
    Palette,
    Home,
    Tag,
    Ticket,
    CreditCard,
    MessageSquare,
    Bell,
    ChevronDown,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    FileText,
    Shield,
} from 'lucide-react'
import { useAdminAuthContext } from '../contexts/AdminAuthContext'
import { RoleBadge } from '../components'

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
    label: string
    path: string
    icon: React.ReactNode
    permission?: string
    children?: NavItem[]
}

// ============================================================================
// NAVIGATION CONFIG
// ============================================================================

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        path: '/admin',
        icon: <LayoutDashboard size={20} />,
        permission: 'dashboard.view',
    },
    {
        label: 'Courses',
        path: '/admin/courses',
        icon: <BookOpen size={20} />,
        permission: 'courses.view',
    },
    {
        label: 'Projects',
        path: '/admin/projects',
        icon: <Briefcase size={20} />,
        permission: 'projects.view',
    },
    {
        label: 'Alumni',
        path: '/admin/alumni',
        icon: <GraduationCap size={20} />,
        permission: 'alumni.view',
    },
    {
        label: 'Users',
        path: '/admin/users',
        icon: <Users size={20} />,
        permission: 'users.view',
        children: [
            { label: 'Students', path: '/admin/users/students', icon: <Users size={18} /> },
            { label: 'Trainers', path: '/admin/users/trainers', icon: <Award size={18} /> },
            { label: 'Team', path: '/admin/users/team', icon: <Briefcase size={18} /> },
        ],
    },
    {
        label: 'Content',
        path: '/admin/content',
        icon: <FileText size={20} />,
        permission: 'homepage.view',
        children: [
            { label: 'Banners', path: '/admin/content/banners', icon: <Image size={18} /> },
            { label: 'Categories', path: '/admin/content/categories', icon: <Tag size={18} /> },
            { label: 'Reviews', path: '/admin/content/reviews', icon: <MessageSquare size={18} /> },
        ],
    },
    {
        label: 'Business',
        path: '/admin/business',
        icon: <CreditCard size={20} />,
        permission: 'transactions.view',
        children: [
            { label: 'Transactions', path: '/admin/business/transactions', icon: <CreditCard size={18} /> },
            { label: 'Coupons', path: '/admin/business/coupons', icon: <Ticket size={18} /> },
        ],
    },
    {
        label: 'Appearance',
        path: '/admin/appearance',
        icon: <Palette size={20} />,
        permission: 'theme.view',
        children: [
            { label: 'Theme', path: '/admin/appearance/theme', icon: <Palette size={18} /> },
            { label: 'Homepage', path: '/admin/appearance/homepage', icon: <Home size={18} /> },
        ],
    },
    {
        label: 'Settings',
        path: '/admin/settings',
        icon: <Settings size={20} />,
        permission: 'settings.view',
    },
    {
        label: 'Admins',
        path: '/admin/admins',
        icon: <Shield size={20} />,
        permission: 'admins.view',
    },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout, hasPermission } = useAdminAuthContext()

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [userMenuOpen, setUserMenuOpen] = useState(false)

    // Toggle expanded nav item
    const toggleExpanded = (path: string) => {
        setExpandedItems((prev) =>
            prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
        )
    }

    // Check if current path matches nav item
    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin'
        }
        return location.pathname.startsWith(path)
    }

    // Handle logout
    const handleLogout = async () => {
        await logout()
        navigate('/admin/login')
    }

    // Filter nav items by permission
    const filteredNavItems = navItems.filter(
        (item) => !item.permission || hasPermission(item.permission)
    )

    // Render nav item
    const renderNavItem = (item: NavItem, depth = 0) => {
        const hasChildren = item.children && item.children.length > 0
        const isExpanded = expandedItems.includes(item.path)
        const active = isActive(item.path)

        return (
            <div key={item.path}>
                <button
                    onClick={() => {
                        if (hasChildren) {
                            toggleExpanded(item.path)
                        } else {
                            navigate(item.path)
                            setMobileMenuOpen(false)
                        }
                    }}
                    className={`
            w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
            ${active
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }
            ${depth > 0 ? 'pl-12' : ''}
          `}
                >
                    {item.icon}
                    {sidebarOpen && (
                        <>
                            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                            {hasChildren && (
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                            )}
                        </>
                    )}
                </button>

                {/* Children */}
                {hasChildren && isExpanded && sidebarOpen && (
                    <div className="mt-1 space-y-1">
                        {item.children!.map((child) => renderNavItem(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 z-40">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <span className="font-semibold text-neutral-900">Admin Panel</span>
                <div className="w-10" />
            </div>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full bg-white border-r border-neutral-200 z-50
          transition-all duration-300 flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-100">
                    {sidebarOpen && (
                        <Link to="/admin" className="font-bold text-xl text-primary-600">
                            Techspert
                        </Link>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:block p-2 hover:bg-neutral-100 rounded-lg text-neutral-500"
                    >
                        <ChevronLeft
                            size={20}
                            className={`transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {filteredNavItems.map((item) => renderNavItem(item))}
                </nav>

                {/* User section */}
                <div className="border-t border-neutral-100 p-4">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                                {user?.displayName?.[0] || user?.email?.[0] || 'A'}
                            </div>
                            {sidebarOpen && (
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-neutral-900 truncate">
                                        {user?.displayName || 'Admin'}
                                    </p>
                                    <RoleBadge role={user?.role || 'admin'} size="sm" />
                                </div>
                            )}
                        </button>

                        {/* User dropdown */}
                        {userMenuOpen && sidebarOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-neutral-200 shadow-lg py-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={16} />
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main
                className={`
          min-h-screen transition-all duration-300
          pt-16 lg:pt-0
          ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}
        `}
            >
                {/* Top bar */}
                <div className="hidden lg:flex h-16 bg-white border-b border-neutral-200 items-center justify-between px-6">
                    {/* Breadcrumb placeholder */}
                    <div className="text-sm text-neutral-500">
                        {location.pathname.split('/').filter(Boolean).map((part, i, arr) => (
                            <span key={part}>
                                {i > 0 && <span className="mx-2">/</span>}
                                <span className={i === arr.length - 1 ? 'text-neutral-900 font-medium capitalize' : 'capitalize'}>
                                    {part}
                                </span>
                            </span>
                        ))}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 hover:bg-neutral-100 rounded-lg text-neutral-500">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                    </div>
                </div>

                {/* Page content */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
