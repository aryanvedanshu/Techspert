import express from 'express'
import {
  getCertificates,
  getCertificate,
  getCertificateById,
  verifyCertificate,
  downloadCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from '../controllers/certificateController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.route('/').get(getCertificates)
router.route('/cert/:certificateId').get(getCertificateById)
router.route('/verify/:verificationCode').get(verifyCertificate)
router.route('/:certificateId/download').get(downloadCertificate)
router.route('/:id').get(getCertificate)

// Protected routes (Admin only)
router.route('/').post(protect, authorize(['super-admin', 'admin']), createCertificate)
router.route('/:id').put(protect, authorize(['super-admin', 'admin']), updateCertificate)
router.route('/:id').delete(protect, authorize(['super-admin', 'admin']), deleteCertificate)

export default router
