/**
 * Sale utility functions for checking if a sale is active
 */

/**
 * Checks if a sale is currently active based on start and end date/time
 * @param {Object} course - Course object with sale fields
 * @returns {Object} - { isActive: boolean, currentPrice: number, originalPrice: number }
 */
export const getSaleStatus = (course) => {
  if (!course) {
    return { isActive: false, currentPrice: course?.price || 0, originalPrice: course?.originalPrice || course?.price || 0 }
  }

  const now = new Date()
  let isActive = false

  // Check if sale fields exist
  if (course.salePrice && course.salePrice > 0) {
    // If we have separate date and time fields
    if (course.saleStartDate && course.saleEndDate) {
      // Combine date and time
      const startDateStr = course.saleStartDate
      const startTimeStr = course.saleStartTime || '00:00'
      const endDateStr = course.saleEndDate
      const endTimeStr = course.saleEndTime || '23:59'

      // Create Date objects from date and time strings
      // Format: YYYY-MM-DDTHH:mm (local time, no timezone)
      let saleStart, saleEnd
      
      try {
        // Parse date and time separately to avoid timezone issues
        const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number)
        const [startHour, startMin] = startTimeStr.split(':').map(Number)
        saleStart = new Date(startYear, startMonth - 1, startDay, startHour, startMin, 0)

        const [endYear, endMonth, endDay] = endDateStr.split('-').map(Number)
        const [endHour, endMin] = endTimeStr.split(':').map(Number)
        saleEnd = new Date(endYear, endMonth - 1, endDay, endHour, endMin, 59)

        // Validate dates
        if (isNaN(saleStart.getTime()) || isNaN(saleEnd.getTime())) {
          console.warn('Invalid sale date format', { startDateStr, startTimeStr, endDateStr, endTimeStr })
          isActive = false
        } else {
          // Check if current time is within sale period
          isActive = now >= saleStart && now <= saleEnd
        }
      } catch (error) {
        console.warn('Error parsing sale dates', error, { startDateStr, startTimeStr, endDateStr, endTimeStr })
        isActive = false
      }
    } 
    // If we have combined date-time fields (legacy support)
    else if (course.saleStart && course.saleEnd) {
      const saleStart = new Date(course.saleStart)
      const saleEnd = new Date(course.saleEnd)
      isActive = now >= saleStart && now <= saleEnd
    }
    // If only salePrice is set, consider it always active (manual sale)
    else if (course.salePrice > 0) {
      isActive = true
    }
  }

  const originalPrice = course.originalPrice || course.price || 0
  const currentPrice = isActive && course.salePrice > 0 
    ? course.salePrice 
    : course.price || 0

  return {
    isActive,
    currentPrice,
    originalPrice: isActive ? originalPrice : currentPrice,
    salePrice: course.salePrice || 0
  }
}

/**
 * Gets the display price for a course (considering active sales)
 * @param {Object} course - Course object
 * @returns {Object} - { price: number, originalPrice: number, discount: number }
 */
export const getDisplayPrice = (course) => {
  const saleStatus = getSaleStatus(course)
  
  return {
    price: saleStatus.currentPrice,
    originalPrice: saleStatus.isActive ? saleStatus.originalPrice : null,
    discount: saleStatus.isActive && saleStatus.originalPrice > saleStatus.currentPrice
      ? Math.round(((saleStatus.originalPrice - saleStatus.currentPrice) / saleStatus.originalPrice) * 100)
      : 0,
    isOnSale: saleStatus.isActive
  }
}

