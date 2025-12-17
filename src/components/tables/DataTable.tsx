/**
 * DataTable.tsx
 * 
 * Reusable data table component with server-side pagination, sorting, and filtering.
 * Designed for admin panel list views.
 * 
 * Features:
 * - Server-side pagination
 * - Column sorting
 * - Search/filter
 * - Row selection
 * - Action buttons
 * - Loading states
 * - Empty states
 * 
 * @module components/tables/DataTable
 */

import React, { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Loader2 } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface Column<T> {
    key: keyof T | string
    header: string
    sortable?: boolean
    render?: (value: unknown, row: T) => React.ReactNode
    width?: string
    align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T extends { id: string }> {
    columns: Column<T>[]
    data: T[]
    loading?: boolean

    // Pagination
    totalItems?: number
    currentPage?: number
    pageSize?: number
    onPageChange?: (page: number) => void
    onPageSizeChange?: (size: number) => void

    // Sorting
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
    onSort?: (column: string, direction: 'asc' | 'desc') => void

    // Search
    searchPlaceholder?: string
    onSearch?: (query: string) => void
    searchValue?: string

    // Selection
    selectable?: boolean
    selectedIds?: string[]
    onSelectionChange?: (ids: string[]) => void

    // Actions
    actions?: (row: T) => React.ReactNode
    bulkActions?: React.ReactNode

    // Empty state
    emptyMessage?: string
    emptyIcon?: React.ReactNode
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataTable<T extends { id: string }>({
    columns,
    data,
    loading = false,
    totalItems = 0,
    currentPage = 1,
    pageSize = 10,
    onPageChange,
    onPageSizeChange,
    sortBy,
    sortDirection = 'asc',
    onSort,
    searchPlaceholder = 'Search...',
    onSearch,
    searchValue = '',
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    actions,
    bulkActions,
    emptyMessage = 'No data found',
    emptyIcon,
}: DataTableProps<T>) {
    const [localSearch, setLocalSearch] = useState(searchValue)

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / pageSize) || 1
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    // Handle search with debounce
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setLocalSearch(value)

        // Debounce the search
        const timeoutId = setTimeout(() => {
            onSearch?.(value)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [onSearch])

    // Handle sort click
    const handleSort = (column: string) => {
        if (!onSort) return

        const newDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc'
        onSort(column, newDirection)
    }

    // Handle row selection
    const handleSelectAll = () => {
        if (!onSelectionChange) return

        if (selectedIds.length === data.length) {
            onSelectionChange([])
        } else {
            onSelectionChange(data.map(row => row.id))
        }
    }

    const handleSelectRow = (id: string) => {
        if (!onSelectionChange) return

        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
        } else {
            onSelectionChange([...selectedIds, id])
        }
    }

    // Get cell value
    const getCellValue = (row: T, key: keyof T | string): unknown => {
        const keys = String(key).split('.')
        let value: unknown = row
        for (const k of keys) {
            value = (value as Record<string, unknown>)?.[k]
        }
        return value
    }

    // Render sort icon
    const renderSortIcon = (column: string) => {
        if (sortBy !== column) {
            return <ArrowUpDown size={14} className="text-neutral-400" />
        }
        return sortDirection === 'asc'
            ? <ArrowUp size={14} className="text-primary-600" />
            : <ArrowDown size={14} className="text-primary-600" />
    }

    return (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {/* Header with search and bulk actions */}
            <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Search */}
                {onSearch && (
                    <div className="relative w-full sm:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            value={localSearch}
                            onChange={handleSearchChange}
                            placeholder={searchPlaceholder}
                            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all text-sm"
                        />
                    </div>
                )}

                {/* Bulk actions */}
                {selectable && selectedIds.length > 0 && bulkActions && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600">
                            {selectedIds.length} selected
                        </span>
                        {bulkActions}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            {/* Selection checkbox */}
                            {selectable && (
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={data.length > 0 && selectedIds.length === data.length}
                                        onChange={handleSelectAll}
                                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                    />
                                </th>
                            )}

                            {/* Column headers */}
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-4 py-3 text-${column.align || 'left'} text-xs font-semibold text-neutral-600 uppercase tracking-wider`}
                                    style={{ width: column.width }}
                                >
                                    {column.sortable && onSort ? (
                                        <button
                                            onClick={() => handleSort(String(column.key))}
                                            className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
                                        >
                                            {column.header}
                                            {renderSortIcon(String(column.key))}
                                        </button>
                                    ) : (
                                        column.header
                                    )}
                                </th>
                            ))}

                            {/* Actions column */}
                            {actions && (
                                <th className="w-20 px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-100">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-12">
                                    <div className="flex flex-col items-center justify-center text-neutral-500">
                                        <Loader2 size={32} className="animate-spin mb-2" />
                                        <span>Loading...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="px-4 py-12">
                                    <div className="flex flex-col items-center justify-center text-neutral-500">
                                        {emptyIcon}
                                        <span className="mt-2">{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row) => (
                                <tr
                                    key={row.id}
                                    className={`hover:bg-neutral-50 transition-colors ${selectedIds.includes(row.id) ? 'bg-primary-50' : ''
                                        }`}
                                >
                                    {/* Selection checkbox */}
                                    {selectable && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                            />
                                        </td>
                                    )}

                                    {/* Data cells */}
                                    {columns.map((column) => {
                                        const value = getCellValue(row, column.key)
                                        return (
                                            <td
                                                key={String(column.key)}
                                                className={`px-4 py-3 text-sm text-${column.align || 'left'}`}
                                            >
                                                {column.render ? column.render(value, row) : String(value ?? '-')}
                                            </td>
                                        )
                                    })}

                                    {/* Actions */}
                                    {actions && (
                                        <td className="px-4 py-3 text-right">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
                <div className="px-4 py-3 border-t border-neutral-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    {/* Items info */}
                    <div className="text-sm text-neutral-600">
                        Showing {startItem} to {endItem} of {totalItems} items
                    </div>

                    {/* Page size selector */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-600">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                                className="border border-neutral-200 rounded-lg px-2 py-1 text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
                            >
                                {[10, 20, 50, 100].map((size) => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>

                        {/* Page navigation */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onPageChange?.(1)}
                                disabled={currentPage === 1}
                                className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronsLeft size={18} />
                            </button>
                            <button
                                onClick={() => onPageChange?.(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <span className="px-3 text-sm text-neutral-600">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={() => onPageChange?.(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                            <button
                                onClick={() => onPageChange?.(totalPages)}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronsRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DataTable
