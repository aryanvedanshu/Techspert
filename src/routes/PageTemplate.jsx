import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { motion } from 'framer-motion'
import { Calendar, User } from 'lucide-react'

const PageTemplate = () => {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [page, setPage] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const q = query(collection(db, 'pages'), where('slug', '==', slug))
                const querySnapshot = await getDocs(q)

                if (querySnapshot.empty) {
                    navigate('/') // Or 404 page
                    return
                }

                const pageData = querySnapshot.docs[0].data()
                if (!pageData.isPublished) {
                    navigate('/')
                    return
                }

                setPage(pageData)
            } catch (error) {
                console.error('Error fetching page:', error)
                navigate('/')
            } finally {
                setLoading(false)
            }
        }

        fetchPage()
    }, [slug, navigate])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!page) return null

    return (
        <div className="min-h-screen bg-white pt-20">
            <div className="container-custom py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-6">
                        {page.title}
                    </h1>

                    <div className="flex items-center gap-6 text-neutral-500 mb-8 border-b border-neutral-200 pb-8">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            <span>{page.updatedAt?.toDate().toLocaleDateString()}</span>
                        </div>
                        {/* Add author if available in future */}
                    </div>

                    <div
                        className="prose prose-lg prose-neutral max-w-none"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </motion.div>
            </div>
        </div>
    )
}

export default PageTemplate
