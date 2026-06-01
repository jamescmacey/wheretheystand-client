<template>
    <div>
        <!-- Filters slot -->
        <div v-if="$slots.filters" class="mb-4">
            <slot name="filters" :filters="filters" :update-filter="updateFilter"></slot>
        </div>

        <!-- Content -->
        <div>
            <!-- Custom content slot (takes items as prop) -->
            <slot v-if="$slots.content" name="content" :items="paginatedItems" :count="count" :page="currentPage" :total-pages="totalPages"></slot>
            
            <!-- Default: item slot (takes item as prop) -->
            <template v-else>
                <slot v-for="item in paginatedItems" :key="getItemKey(item)" name="item" :item="item"></slot>
            </template>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center gap-2">
                <UButton 
                    :disabled="currentPage === 1"
                    @click="currentPage = 1"
                    variant="outline"
                    size="sm"
                    icon="i-lucide-chevrons-left"
                    :aria-label="'First page'"
                />
                <UButton 
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                    variant="outline"
                    size="sm"
                    icon="i-lucide-chevron-left"
                    :aria-label="'Previous page'"
                />
                
                <div class="flex items-center gap-1">
                    <template v-for="page in visiblePages" :key="page">
                        <UButton
                            v-if="typeof page === 'number'"
                            :variant="page === currentPage ? 'solid' : 'outline'"
                            :color="page === currentPage ? 'primary' : 'neutral'"
                            size="sm"
                            @click="currentPage = page"
                            :aria-label="`Page ${page}`"
                            :aria-current="page === currentPage ? 'page' : undefined"
                        >
                            {{ page }}
                        </UButton>
                        <span v-else class="px-2 text-muted">...</span>
                    </template>
                </div>
                
                <UButton 
                    :disabled="currentPage === totalPages"
                    @click="currentPage++"
                    variant="outline"
                    size="sm"
                    icon="i-lucide-chevron-right"
                    trailing
                    :aria-label="'Next page'"
                />
                <UButton 
                    :disabled="currentPage === totalPages"
                    @click="currentPage = totalPages"
                    variant="outline"
                    size="sm"
                    icon="i-lucide-chevrons-right"
                    trailing
                    :aria-label="'Last page'"
                />
            </div>

            <!-- Results count info -->
            <p v-if="showResultsCount" class="text-muted text-sm mt-4 text-center">
                Showing {{ startItem }} to {{ endItem }} of {{ count }} {{ itemLabel || 'items' }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    /** Full list of items to paginate */
    items: any[]
    /** Number of items per page */
    itemsPerPage?: number
    /** Initial page number */
    initialPage?: number
    /** Additional query parameters (filters, etc.) */
    queryParams?: Record<string, any>
    /** Function to extract unique key from item (default: item.id) */
    itemKey?: (item: any) => string | number
    /** Label for items in results count (e.g., "bills", "votes") */
    itemLabel?: string
    /** Whether to show results count */
    showResultsCount?: boolean
    /** Prefix for URL query parameters to avoid conflicts (e.g., "bills", "votes") */
    urlPrefix?: string
    /** Whether to sync state with URL query parameters */
    syncUrl?: boolean
    /** Custom filter function. If provided, this will be used instead of the default filtering logic. */
    customFilter?: (items: any[], filters: Record<string, any>) => any[]
    /** Custom sort function. If provided, this will be used to sort items after filtering. */
    customSort?: (items: any[], filters: Record<string, any>) => any[]
}

const props = withDefaults(defineProps<Props>(), {
    itemsPerPage: 20,
    initialPage: 1,
    queryParams: () => ({}),
    itemKey: (item: any) => item.id,
    showResultsCount: true,
    syncUrl: false,
})

const route = useRoute()
const router = useRouter()

// Helper functions to get prefixed URL parameter names
const getPageParam = () => props.urlPrefix ? `${props.urlPrefix}_page` : 'page'
const getPageSizeParam = () => props.urlPrefix ? `${props.urlPrefix}_page_size` : 'page_size'
const getFilterParam = (key: string) => props.urlPrefix ? `${props.urlPrefix}_${key}` : key

// Helper function to normalize query param value (handle arrays and strings)
const normalizeQueryValue = (value: string | string[] | null | undefined): any => {
    if (!value) return null
    if (Array.isArray(value)) {
        return value.length === 1 ? value[0] : value
    }
    // Check if it's a comma-separated string that should be an array
    if (typeof value === 'string' && value.includes(',')) {
        return value.split(',').map(v => v.trim()).filter(v => v)
    }
    return value
}

// Helper function to read URL query parameters
const readUrlParams = () => {
    if (!props.syncUrl) return {}
    
    const params: Record<string, any> = {}
    const pageParam = getPageParam()
    const pageSizeParam = getPageSizeParam()
    
    // Read page
    if (route.query[pageParam]) {
        const pageValue = normalizeQueryValue(route.query[pageParam] as string | string[] | null)
        if (pageValue) {
            const page = parseInt(pageValue as string, 10)
            if (!isNaN(page) && page > 0) {
                params._page = page
            }
        }
    }
    
    // Read page size
    if (route.query[pageSizeParam]) {
        const pageSizeValue = normalizeQueryValue(route.query[pageSizeParam] as string | string[] | null)
        if (pageSizeValue) {
            const pageSize = parseInt(pageSizeValue as string, 10)
            if (!isNaN(pageSize) && pageSize > 0) {
                params._pageSize = pageSize
            }
        }
    }
    
    // Read filters (all params that start with prefix_ or are unprefixed if no prefix)
    Object.keys(route.query).forEach(key => {
        if (key === pageParam || key === pageSizeParam) return
        
        if (props.urlPrefix) {
            if (key.startsWith(`${props.urlPrefix}_`)) {
                const filterKey = key.replace(`${props.urlPrefix}_`, '')
                params[filterKey] = normalizeQueryValue(route.query[key] as string | string[] | null)
            }
        } else {
            // If no prefix, only include params that aren't from other components
            // We'll assume unprefixed params belong to this component if no prefix is set
            // This is a bit risky, so having a prefix is recommended
            params[key] = normalizeQueryValue(route.query[key] as string | string[] | null)
        }
    })
    
    return params
}

// Initialize state from URL or props
const urlParams = readUrlParams()
const initialPage = urlParams._page ?? props.initialPage
const initialPageSize = urlParams._pageSize ?? props.itemsPerPage
const initialFilters = { ...props.queryParams }

// Merge URL filters with prop filters (URL takes precedence)
Object.keys(urlParams).forEach(key => {
    if (key !== '_page' && key !== '_pageSize') {
        initialFilters[key] = urlParams[key]
    }
})

// Reactive state
const currentPage = ref(initialPage)
const currentPageSize = ref(initialPageSize)
const filters = ref<Record<string, any>>(initialFilters)

// Flags to prevent circular updates
const isUpdatingFromUrl = ref(false)
const isMounted = ref(false)

// Computed filtered items (apply filters if needed)
const filteredItems = computed(() => {
    let result = [...props.items]
    
    // If no filters, return all items (unless custom filter/sort is provided)
    if (Object.keys(filters.value).length === 0 && !props.customFilter && !props.customSort) {
        return result
    }
    
    // Apply custom filter if provided
    if (props.customFilter) {
        result = props.customFilter(result, filters.value)
    } else if (Object.keys(filters.value).length > 0) {
        // Apply default filters - basic implementation
        result = result.filter(item => {
            return Object.entries(filters.value).every(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    return true
                }
                
                // Basic filtering - can be extended with custom filter functions
                const itemValue = item[key]
                if (Array.isArray(value)) {
                    return value.some(v => itemValue === v || (typeof itemValue === 'string' && itemValue.includes(v)))
                }
                return itemValue === value || (typeof itemValue === 'string' && itemValue.includes(value))
            })
        })
    }
    
    // Apply custom sort if provided
    if (props.customSort) {
        result = props.customSort(result, filters.value)
    }
    
    return result
})

// Computed paginated items
const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * currentPageSize.value
    const end = start + currentPageSize.value
    return filteredItems.value.slice(start, end)
})

// Computed values
const count = computed(() => filteredItems.value.length)
const totalPages = computed(() => Math.ceil(count.value / currentPageSize.value))

// Validate and correct page number if invalid
watch([totalPages, currentPage], ([total, page]) => {
    if (total > 0) {
        if (page > total) {
            currentPage.value = 1
            if (isMounted.value && props.syncUrl) {
                nextTick(() => {
                    updateUrl()
                })
            }
        } else if (page < 1) {
            currentPage.value = 1
            if (isMounted.value && props.syncUrl) {
                nextTick(() => {
                    updateUrl()
                })
            }
        }
    }
}, { immediate: true })

const startItem = computed(() => {
    if (count.value === 0) return 0
    return (currentPage.value - 1) * currentPageSize.value + 1
})

const endItem = computed(() => {
    const end = currentPage.value * currentPageSize.value
    return Math.min(end, count.value)
})

// Computed visible page numbers for pagination
const visiblePages = computed(() => {
    const pages: (number | string)[] = []
    const total = totalPages.value
    const current = currentPage.value
    const maxVisible = 7
    
    if (total <= maxVisible) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    } else {
        // Always show first page
        pages.push(1)
        
        if (current <= 3) {
            // Near the start
            for (let i = 2; i <= 4; i++) {
                pages.push(i)
            }
            pages.push('...')
            pages.push(total)
        } else if (current >= total - 2) {
            // Near the end
            pages.push('...')
            for (let i = total - 3; i <= total; i++) {
                pages.push(i)
            }
        } else {
            // In the middle
            pages.push('...')
            for (let i = current - 1; i <= current + 1; i++) {
                pages.push(i)
            }
            pages.push('...')
            pages.push(total)
        }
    }
    
    return pages
})

// Helper function to get item key
const getItemKey = (item: any): string | number => {
    return props.itemKey(item)
}

// Method to handle refresh - resets to page 1
const handleRefresh = () => {
    currentPage.value = 1
    if (props.syncUrl && isMounted.value) {
        updateUrl()
    }
}

// Method to update filters
const updateFilter = (key: string, value: any) => {
    filters.value[key] = value
    // Reset to page 1 when filters change
    currentPage.value = 1
    if (props.syncUrl) {
        updateUrl()
    }
}

// Method to update page size
const updatePageSize = (size: number) => {
    currentPageSize.value = size
    currentPage.value = 1 // Reset to page 1 when page size changes
    if (props.syncUrl) {
        updateUrl()
    }
}

// Method to update URL query parameters
const updateUrl = () => {
    if (!props.syncUrl || isUpdatingFromUrl.value) return
    
    const query = { ...route.query }
    const pageParam = getPageParam()
    const pageSizeParam = getPageSizeParam()
    
    // Update page
    if (currentPage.value === 1) {
        // Remove page param if it's 1 (cleaner URLs)
        delete query[pageParam]
    } else {
        query[pageParam] = currentPage.value.toString()
    }
    
    // Update page size
    if (currentPageSize.value === props.itemsPerPage) {
        // Remove page size param if it's the default
        delete query[pageSizeParam]
    } else {
        query[pageSizeParam] = currentPageSize.value.toString()
    }
    
    // Update filter params
    // First, remove old params with this prefix
    Object.keys(query).forEach(key => {
        if (props.urlPrefix) {
            if (key.startsWith(`${props.urlPrefix}_`) && key !== pageParam && key !== pageSizeParam) {
                delete query[key]
            }
        } else {
            // If no prefix, be more careful - only remove if we know it's ours
            // This is why having a prefix is recommended
        }
    })
    
    // Add current filter params
    Object.entries(filters.value).forEach(([key, value]) => {
        const paramKey = getFilterParam(key)
        if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                // For arrays, store as array in query (Nuxt will handle it)
                query[paramKey] = value.map(v => v.toString())
            } else {
                query[paramKey] = value.toString()
            }
        } else {
            // Remove empty filter params
            delete query[paramKey]
        }
    })
    
    // Update URL without triggering navigation (replace to avoid history spam)
    router.replace({ query })
}

// Watch for state changes and update URL (only after mount)
watch([currentPage, currentPageSize, filters], () => {
    if (isMounted.value && props.syncUrl) {
        updateUrl()
    }
}, { deep: true })

// Set mounted flag after initial render
onMounted(() => {
    isMounted.value = true
})

// Watch for URL changes (browser back/forward)
watch(() => route.query, (newQuery) => {
    if (!props.syncUrl || isUpdatingFromUrl.value) return
    
    isUpdatingFromUrl.value = true
    
    const urlParams = readUrlParams()
    
    // Update page
    if (urlParams._page !== undefined && urlParams._page !== currentPage.value) {
        currentPage.value = urlParams._page
    }
    
    // Update page size
    if (urlParams._pageSize !== undefined && urlParams._pageSize !== currentPageSize.value) {
        currentPageSize.value = urlParams._pageSize
    }
    
    // Update filters
    const newFilters: Record<string, any> = { ...props.queryParams }
    Object.keys(urlParams).forEach(key => {
        if (key !== '_page' && key !== '_pageSize') {
            newFilters[key] = urlParams[key]
        }
    })
    
    // Only update if filters actually changed
    const filtersChanged = JSON.stringify(filters.value) !== JSON.stringify(newFilters)
    if (filtersChanged) {
        filters.value = newFilters
    }
    
    isUpdatingFromUrl.value = false
}, { deep: true })

// Watch for external queryParams changes
watch(() => props.queryParams, (newParams) => {
    if (isUpdatingFromUrl.value) return
    
    filters.value = { ...newParams }
    currentPage.value = 1
    if (props.syncUrl) {
        updateUrl()
    }
}, { deep: true })

// Watch for items changes and reset to page 1 if needed
watch(() => props.items, () => {
    // If current page is beyond available pages, reset to page 1
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = 1
    }
})

// Expose methods and state for parent components
defineExpose({
    handleRefresh,
    currentPage,
    currentPageSize,
    filters,
    items: paginatedItems,
    count,
    totalPages,
    updateFilter,
    updatePageSize
})
</script>

