import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useAnimate } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

const Carousel = ({ items, renderItem, autoPlay = true, interval = 4000 }) => {
  const [itemsToShow, setItemsToShow] = useState(3)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scope, animate] = useAnimate()
  const timeoutRef = useRef(null)
  const isTransitioning = useRef(false)

  // Responsive items to show
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1)
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2)
      } else {
        setItemsToShow(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prepare items with clones for infinite loop
  // Structure: [Tail Clones] [Real Items] [Head Clones]
  // We need enough clones to cover the view width (itemsToShow)
  const extendedItems = items && items.length > 0 ? [
    ...items.slice(-itemsToShow), // Tail clones (last N items at the start)
    ...items,                     // Real items
    ...items.slice(0, itemsToShow) // Head clones (first N items at the end)
  ] : []

  // Initialize index to the first real item (after tail clones)
  useEffect(() => {
    if (items && items.length > 0) {
      setCurrentIndex(itemsToShow)
    }
  }, [itemsToShow, items])

  // Handle slide movement
  const moveTo = useCallback(async (index, duration = 0.5) => {
    if (!scope.current) return

    isTransitioning.current = true
    setCurrentIndex(index)

    const totalItems = items.length + 2 * itemsToShow
    await animate(scope.current, { x: `-${index * (100 / totalItems)}%` }, { duration, ease: "easeInOut" })

    // Check for boundary resets
    // If we are at the head clones (end of list), jump to the start of real items
    if (index >= items.length + itemsToShow) {
      const newIndex = itemsToShow
      setCurrentIndex(newIndex)
      await animate(scope.current, { x: `-${newIndex * (100 / totalItems)}%` }, { duration: 0 })
    }

    // If we are at the tail clones (start of list), jump to the end of real items
    if (index < itemsToShow) {
      const resetIndex = index + items.length
      setCurrentIndex(resetIndex)
      await animate(scope.current, { x: `-${resetIndex * (100 / totalItems)}%` }, { duration: 0 })
    }

    isTransitioning.current = false
  }, [items, itemsToShow, animate, scope])

  const nextSlide = useCallback(() => {
    if (isTransitioning.current || !items || items.length === 0) return
    moveTo(currentIndex + 1)
  }, [currentIndex, items, moveTo])

  const prevSlide = useCallback(() => {
    if (isTransitioning.current || !items || items.length === 0) return
    moveTo(currentIndex - 1)
  }, [currentIndex, items, moveTo])

  // Auto play
  useEffect(() => {
    if (autoPlay && items && items.length > itemsToShow) {
      timeoutRef.current = setTimeout(nextSlide, interval)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [nextSlide, autoPlay, interval, items, itemsToShow])

  // Handle direct jump (indicators)
  const jumpTo = (realIndex) => {
    if (isTransitioning.current) return
    // Real index 0 maps to extended index `itemsToShow`
    moveTo(itemsToShow + realIndex)
  }

  if (!items || items.length === 0) return null

  // If we have fewer items than we want to show, just show them all centered
  if (items.length <= itemsToShow) {
    return (
      <div className="flex justify-center gap-6">
        {items.map((item, index) => (
          <div key={index} className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    )
  }

  // Calculate active dot index
  // currentIndex is in extended space.
  // We need to map it to 0...items.length-1
  // Real items are from itemsToShow to itemsToShow + items.length - 1
  let activeDotIndex = 0
  if (currentIndex >= itemsToShow && currentIndex < itemsToShow + items.length) {
    activeDotIndex = currentIndex - itemsToShow
  } else if (currentIndex < itemsToShow) {
    // In tail clones
    activeDotIndex = items.length - (itemsToShow - currentIndex)
  } else {
    // In head clones
    activeDotIndex = currentIndex - (itemsToShow + items.length)
  }
  // Normalize just in case
  activeDotIndex = (activeDotIndex + items.length) % items.length

  return (
    <div className="relative group">
      {/* Main Carousel Container */}
      <div className="overflow-hidden">
        <div
          ref={scope}
          className="flex"
          style={{
            // Width needs to accommodate all extended items
            // Each item takes (100 / itemsToShow)% of the viewport width
            // Total width relative to viewport = (extendedItems.length / itemsToShow) * 100%
            width: `${(extendedItems.length / itemsToShow) * 100}%`,
            // Initial position (will be overridden by animate, but good for SSR/initial render)
            transform: `translateX(-${currentIndex * (100 / extendedItems.length)}%)`
          }}
        >
          {extendedItems.map((item, index) => (
            <div
              key={`${index}-${item.id || index}`}
              className="flex-shrink-0 px-3"
              style={{ width: `${100 / extendedItems.length}%` }}
            >
              {renderItem(item, index % items.length)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-4 md:-ml-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white rounded-full"
        >
          <ChevronLeft size={24} />
        </Button>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-0 -mr-4 md:-mr-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white rounded-full"
        >
          <ChevronRight size={24} />
        </Button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => jumpTo(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${idx === activeDotIndex
                ? 'w-8 bg-primary-600'
                : 'w-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel
