'use client'

import { Search } from 'lucide-react'
import { Input } from '@bloomwell/ui'
import { cn } from '@/lib/utils'

export interface WebinarFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedHost: string
  onHostChange: (host: string) => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  sortBy: 'date-asc' | 'date-desc' | 'popularity'
  onSortChange: (sort: 'date-asc' | 'date-desc' | 'popularity') => void
  hosts: string[]
  categories: string[]
}

export function WebinarFilters({
  searchQuery,
  onSearchChange,
  selectedHost,
  onHostChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  hosts,
  categories,
}: WebinarFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search webinars..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-4">
        {/* Host Filter */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="host-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Host
          </label>
          <select
            id="host-filter"
            value={selectedHost}
            onChange={(e) => onHostChange(e.target.value)}
            className={cn(
              'w-full rounded-md border border-gray-300 px-3 py-2 text-sm',
              'bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
              'hover:border-gray-400 transition-colors'
            )}
          >
            <option value="">All Hosts</option>
            {hosts.map((host) => (
              <option key={host} value={host}>
                {host}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={cn(
              'w-full rounded-md border border-gray-300 px-3 py-2 text-sm',
              'bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
              'hover:border-gray-400 transition-colors'
            )}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'date-asc' | 'date-desc' | 'popularity')}
            className={cn(
              'w-full rounded-md border border-gray-300 px-3 py-2 text-sm',
              'bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
              'hover:border-gray-400 transition-colors'
            )}
          >
            <option value="date-asc">Date (Earliest)</option>
            <option value="date-desc">Date (Latest)</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>
    </div>
  )
}

