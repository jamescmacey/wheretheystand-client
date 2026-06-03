<template>
    <div>
        <!-- Filters slot -->
        <div v-if="$slots.filters" class="mb-4">
            <slot name="filters" :filters="filters" :update-filter="updateFilter"></slot>
        </div>

        <!-- Loading state -->
        <UCard v-if="status === 'pending'" variant="subtle" class="w-full">
            <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading...</h3>
                <UProgress animation="swing" />
            </div>
        </UCard>

        <!-- Error state -->
        <UCard v-else-if="status === 'error'" variant="subtle" class="w-full">
            <UEmpty :title="errorTitle || 'Error loading content'"
                :description="errorDescription || 'An error occurred while loading content. Please try again.'">
                <template #actions>
                    <UButton variant="subtle" color="neutral" @click="handleRefresh()" class="mt-4" icon="i-lucide-refresh-cw"
                        trailing>
                        Refresh
                    </UButton>
                </template>
            </UEmpty>
        </UCard>

        <!-- Content -->
        <div v-else-if="status === 'success'">
            <!-- Custom content slot (takes items as prop) -->
            <slot v-if="$slots.content" name="content" :items="items" :count="count" :page="currentPage" :total-pages="totalPages"></slot>
            
            <!-- Default: item slot (takes item as prop) -->
            <template v-else>
                <slot v-for="item in items" :key="getItemKey(item)" name="item" :item="item"></slot>
            </template>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center gap-2">
                <WContentPaginationButton
                    :to="pageHref(1)"
                    :disabled="currentPage === 1"
                    icon="i-lucide-chevrons-left"
                    aria-label="First page"
                    @navigate="currentPage = 1"
                />
                <WContentPaginationButton
                    :to="pageHref(currentPage - 1)"
                    :disabled="currentPage === 1"
                    icon="i-lucide-chevron-left"
                    aria-label="Previous page"
                    rel="prev"
                    @navigate="currentPage--"
                />

                <div class="flex items-center gap-1">
                    <template v-for="page in visiblePages" :key="page">
                        <WContentPaginationButton
                            v-if="typeof page === 'number'"
                            :to="pageHref(page)"
                            :variant="page === currentPage ? 'solid' : 'outline'"
                            :color="page === currentPage ? 'primary' : 'neutral'"
                            :aria-label="`Page ${page}`"
                            :aria-current="page === currentPage ? 'page' : false"
                            @navigate="currentPage = page"
                        >
                            {{ page }}
                        </WContentPaginationButton>
                        <span v-else class="px-2 text-muted">...</span>
                    </template>
                </div>

                <WContentPaginationButton
                    :to="pageHref(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    icon="i-lucide-chevron-right"
                    trailing
                    aria-label="Next page"
                    rel="next"
                    @navigate="currentPage++"
                />
                <WContentPaginationButton
                    :to="pageHref(totalPages)"
                    :disabled="currentPage === totalPages"
                    icon="i-lucide-chevrons-right"
                    trailing
                    aria-label="Last page"
                    @navigate="currentPage = totalPages"
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
import type { Ref } from 'vue'

interface PaginatedResponse {
    count: number
    next: string | null
    previous: string | null
    results: any[]
}

interface Props {
    /** API endpoint URL (relative to apiBase or absolute) */
    endpoint: string
    /** Number of items per page */
    itemsPerPage?: number
    /** Initial page number */
    initialPage?: number
    /** Additional query parameters (filters, etc.) */
    queryParams?: Record<string, any>
    /** Custom key for useAsyncData (auto-generated if not provided) */
    dataKey?: string
    /** Function to extract unique key from item (default: item.id) */
    itemKey?: (item: any) => string | number
    /** Label for items in results count (e.g., "bills", "votes") */
    itemLabel?: string
    /** Whether to show results count */
    showResultsCount?: boolean
    /** Custom error title */
    errorTitle?: string
    /** Custom error description */
    errorDescription?: string
    /** Prefix for URL query parameters to avoid conflicts (e.g., "bills", "votes") */
    urlPrefix?: string
    /** Whether to sync state with URL query parameters */
    syncUrl?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    itemsPerPage: 20,
    initialPage: 1,
    queryParams: () => ({}),
    itemKey: (item: any) => item.id,
    showResultsCount: true,
    syncUrl: true,
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()
const router = useRouter()

// Helper functions to get prefixed URL parameter names
const getPageParam = () => props.urlPrefix ? `${props.urlPrefix}_page` : 'page'
const getPageSizeParam = () => props.urlPrefix ? `${props.urlPrefix}_page_size` : 'page_size'

const { pageHref } = usePaginationPageHref(getPageParam())
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

// Computed endpoint URL
const endpointUrl = computed(() => {
    // If endpoint is absolute, use it as-is; otherwise prepend apiBase
    const baseUrl = props.endpoint.startsWith('http') ? '' : apiBase
    return baseUrl + props.endpoint
})

// Computed data key for useAsyncData
const dataKey = computed(() => {
    if (props.dataKey) return props.dataKey
    return `paginated-${props.endpoint}-page-${currentPage.value}-size-${currentPageSize.value}-${JSON.stringify(filters.value)}`
})

// Fetch function
const fetchData = async (): Promise<PaginatedResponse> => {
    const queryParams = new URLSearchParams()
    
    // Add page parameter
    queryParams.append('page', currentPage.value.toString())
    queryParams.append('page_size', currentPageSize.value.toString())
    
    // Add filters/query params
    Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            if (Array.isArray(value)) {
                value.forEach(v => queryParams.append(key, v.toString()))
            } else {
                queryParams.append(key, value.toString())
            }
        }
    })
    
    // Build URL - handle existing query params in endpoint
    const baseUrl = endpointUrl.value
    const separator = baseUrl.includes('?') ? '&' : '?'
    const url = `${baseUrl}${separator}${queryParams.toString()}`
    
    return await $fetch<PaginatedResponse>(url)
}

// Fetch data using useAsyncData
const { data, status, error, refresh } = await useAsyncData<PaginatedResponse>(
    dataKey,
    fetchData,
    { watch: [currentPage, currentPageSize, filters] }
)

// Computed values
const items = computed(() => data.value?.results || [])
const count = computed(() => data.value?.count || 0)
const totalPages = computed(() => Math.ceil(count.value / currentPageSize.value))

// Validate and correct page number if invalid
// This runs after data loads to ensure we have accurate totalPages
watch([totalPages, currentPage, status], ([total, page, dataStatus]) => {
    // Only validate if we have successfully loaded data
    if (dataStatus === 'success' && total > 0) {
        if (page > total) {
            // Page number is invalid (greater than total pages), reset to page 1
            currentPage.value = 1
            // Update URL if syncing
            if (isMounted.value && props.syncUrl) {
                nextTick(() => {
                    updateUrl()
                })
            }
        } else if (page < 1) {
            // Page number is less than 1, reset to page 1
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

// Method to handle refresh - resets to page 1 before refreshing
const handleRefresh = () => {
    currentPage.value = 1
    if (props.syncUrl && isMounted.value) {
        updateUrl()
    }
    // Wait a tick for URL update, then refresh
    nextTick(() => {
        refresh()
    })
}

// Method to update filters
const updateFilter = (key: string, value: any) => {
    filters.value[key] = value
    // Reset to page 1 when filters change
    currentPage.value = 1
    updateUrl()
}

// Method to update page size
const updatePageSize = (size: number) => {
    currentPageSize.value = size
    currentPage.value = 1 // Reset to page 1 when page size changes
    updateUrl()
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
    if (isMounted.value) {
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
    updateUrl()
}, { deep: true })

// Expose methods and state for parent components
defineExpose({
    refresh,
    handleRefresh,
    currentPage,
    currentPageSize,
    filters,
    items,
    count,
    totalPages,
    updateFilter,
    updatePageSize
})
</script>

