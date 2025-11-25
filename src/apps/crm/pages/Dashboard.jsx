import { motion } from 'framer-motion'
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react'

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-800 p-6 rounded-2xl border border-neutral-700 hover:border-neutral-600 transition-colors"
    >
        <div className="flex items-start justify-between mb-4">
            <div>
                <p className="text-neutral-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp size={14} />
                {change}
            </span>
            <span className="text-neutral-500">vs last month</span>
        </div>
    </motion.div>
)

const Dashboard = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">CRM Overview</h1>
                <p className="text-neutral-400">Welcome back! Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Contacts"
                    value="12,345"
                    change="+12%"
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Pipeline Value"
                    value="$45.2k"
                    change="+8.5%"
                    icon={DollarSign}
                    color="emerald"
                />
                <StatCard
                    title="Active Workflows"
                    value="24"
                    change="+2"
                    icon={Activity}
                    color="purple"
                />
                <StatCard
                    title="Conversion Rate"
                    value="3.2%"
                    change="+0.4%"
                    icon={TrendingUp}
                    color="orange"
                />
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-neutral-800 rounded-2xl border border-neutral-700 p-6">
                <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center font-bold">
                                JD
                            </div>
                            <div>
                                <p className="text-white font-medium">John Doe <span className="text-neutral-400 font-normal">completed lesson</span> Introduction to React</p>
                                <p className="text-xs text-neutral-500">2 minutes ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
