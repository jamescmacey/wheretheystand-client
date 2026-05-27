<template>
    <UContainer>
        <div v-if="status === 'success' && workbook" class="mt-8">
            <h4 class="text-muted text-sm uppercase mb-2">Workbook</h4>
            <p v-if="!isClaimed" class="text-sm text-muted mb-4">
                Claim this workbook to edit its name and files.
            </p>
            <UInput
                v-if="editingName && isClaimed"
                v-model="draftName"
                autofocus
                size="xl"
                class="text-2xl font-bold mb-4 w-full"
                :loading="savingName"
                :disabled="savingName"
                @keydown.enter.prevent="saveName"
                @keydown.escape="cancelEditing"
                @blur="saveName"
            />
            <h1
                v-else
                class="text-2xl font-bold mb-4 rounded px-1 -mx-1"
                :class="isClaimed
                    ? 'cursor-pointer hover:bg-elevated/50 transition-colors'
                    : ''"
                :title="isClaimed ? 'Click to rename' : undefined"
                @click="startEditing"
            >
                {{ workbook.name }}
            </h1>
            <UUser v-if="workbook.user" :name="workbook.user.first_name + ' ' + workbook.user.last_name" description="Workbook owner" :avatar="{
                loading: 'lazy',
                src: workbook.user.avatar ?? undefined,
            }" />
            <div v-else class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <UUser name="System" description="Unassigned workbook" :avatar="{
                    loading: 'lazy',
                    icon: 'i-lucide-server',
                }" />
                <UButton
                    label="Claim"
                    icon="i-lucide-user-check"
                    variant="outline"
                    :loading="claiming"
                    @click="claim"
                />
            </div>
            <USeparator class="my-4"/>
            <h4 class="text-muted text-sm uppercase mb-2">Files</h4>
            <UFileUpload
                v-if="isClaimed"
                v-model="pendingFiles"
                multiple
                label="Upload files"
                description="Select one or more files to add to this workbook"
                class="mb-4"
                :disabled="uploadingFiles"
                @change="onFilesSelected"
            />
            <div v-if="workbook.files.length > 0" class="space-y-4">
                <UCard v-for="file in workbook.files" :key="file.id" variant="soft">
                    <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <ULink
                            :href="fileViewUrl(file)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="min-w-0 flex-1 text-sm font-bold truncate"
                        >
                            {{ fileDisplayName(file) }}
                        </ULink>
                        <div class="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                            <UButton
                                :href="fileViewUrl(file)"
                                target="_blank"
                                rel="noopener noreferrer"
                                icon="i-lucide-external-link"
                                variant="ghost"
                                color="neutral"
                                aria-label="View file"
                            />
                            <UButton
                                v-if="isClaimed"
                                icon="i-lucide-trash"
                                variant="ghost"
                                color="error"
                                aria-label="Delete file"
                                :loading="deletingFileId === file.id"
                                :disabled="deletingFileId !== null"
                                @click="deleteFile(file)"
                            />
                        </div>
                    </div>
                </UCard>
            </div>
            <UEmpty v-else title="No files found" description="No files found for this workbook" />
        </div>
        <div v-else-if="status === 'error'">
            <UEmpty title="Error loading workbook"
                description="An error occurred while loading the workbook. Please try again." />
            <p v-if="error" class="text-muted text-xs text-center mt-4">
                {{ error.statusCode }}: {{ error }}
            </p>
        </div>
        <div v-else-if="status === 'pending'">
            <div class="my-16 w-1/2 mx-auto flex flex-col items-center justify-center text-center">
                <h3 class="mb-2 text-muted">Loading workbook...</h3>
                <UProgress animation="swing" />
            </div>
        </div>
    </UContainer>

</template>

<script setup lang="ts">
import { claimWorkbook } from '~/composables/useWorkbookListSection'

interface WorkbookFileRecord {
    id: string
    file: string
}

interface WorkbookUser {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
    avatar: string | null
}

interface Workbook {
    id: string
    name: string
    user: WorkbookUser | null
    files: WorkbookFileRecord[]
    created_at: string
    updated_at: string
}

const route = useRoute()

const workbookId = route.params.workbookId as string

const { data: workbook, error, status } = await useAsyncData<Workbook>(
    `workbook-admin-${workbookId}`,
    () => useAdminApi().get<Workbook>(`v2/workbooks/${workbookId}/`),
    { deep: true },
)

const toast = useToast()
const { session } = useAdminSession()
const claiming = ref(false)
const editingName = ref(false)
const draftName = ref('')
const savingName = ref(false)
const pendingFiles = ref<File[] | null>(null)
const uploadingFiles = ref(false)
const deletingFileId = ref<string | null>(null)

const { apiOrigin } = useAdminApi()

const isClaimed = computed(() => Boolean(workbook.value?.user))

function fileDisplayName(file: WorkbookFileRecord) {
    const path = file.file?.split('?')[0] ?? ''
    const name = path.split('/').pop()
    return name || 'File'
}

function fileViewUrl(file: WorkbookFileRecord) {
    const url = file.file
    if (!url) return '#'
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const origin = apiOrigin()
    return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}

async function deleteFile(file: WorkbookFileRecord) {
    if (!isClaimed.value || deletingFileId.value) return

    deletingFileId.value = file.id
    try {
        await useAdminApi().delete(`v2/workbooks/${workbookId}/files/${file.id}/`)
        if (workbook.value) {
            const files = workbook.value.files.filter((f) => f.id !== file.id)
            workbook.value = { ...workbook.value, files }
        }
        toast.add({
            title: 'File deleted',
            color: 'success',
        })
    } catch {
        toast.add({
            title: 'Could not delete file',
            description: 'Please try again.',
            color: 'error',
        })
    } finally {
        deletingFileId.value = null
    }
}

async function uploadWorkbookFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return useAdminApi().post<WorkbookFileRecord>(
        `v2/workbooks/${workbookId}/files/`,
        formData,
    )
}

async function onFilesSelected() {
    if (!isClaimed.value) return

    const files = pendingFiles.value
    if (!files?.length || uploadingFiles.value) return

    uploadingFiles.value = true
    const created: WorkbookFileRecord[] = []
    const failed: string[] = []

    await Promise.all(
        files.map(async (file) => {
            try {
                created.push(await uploadWorkbookFile(file))
            } catch {
                failed.push(file.name)
            }
        }),
    )

    if (workbook.value && created.length) {
        workbook.value = {
            ...workbook.value,
            files: [...created, ...workbook.value.files],
        }
    }

    pendingFiles.value = null

    if (created.length) {
        toast.add({
            title: created.length === 1 ? 'File uploaded' : `${created.length} files uploaded`,
            color: 'success',
        })
    }
    if (failed.length) {
        toast.add({
            title: 'Some uploads failed',
            description: failed.join(', '),
            color: 'error',
        })
    }

    uploadingFiles.value = false
}

function startEditing() {
    if (!isClaimed.value || !workbook.value) return
    draftName.value = workbook.value.name
    editingName.value = true
}

function cancelEditing() {
    editingName.value = false
    draftName.value = ''
}

async function claim() {
    const userId = session.value?.user?.id
    if (!userId || !workbook.value || workbook.value.user) return

    claiming.value = true
    try {
        const updated = await claimWorkbook(workbookId, userId)
        workbook.value = { ...workbook.value, ...updated }
        toast.add({ title: 'Workbook claimed', color: 'success' })
    } catch {
        toast.add({
            title: 'Could not claim workbook',
            description: 'Please try again.',
            color: 'error',
        })
    } finally {
        claiming.value = false
    }
}

async function saveName() {
    if (!isClaimed.value || !editingName.value || savingName.value) return

    const trimmed = draftName.value.trim()
    const current = workbook.value?.name ?? ''

    if (!trimmed || trimmed === current) {
        cancelEditing()
        return
    }

    savingName.value = true
    try {
        const updated = await useAdminApi().patch<Workbook>(`v2/workbooks/${workbookId}/`, { name: trimmed })
        if (workbook.value) {
            workbook.value = { ...workbook.value, ...updated }
        }
        cancelEditing()
    } catch (e) {
        toast.add({
            title: 'Could not rename workbook',
            description: 'Please try again.',
            color: 'error',
        })
    } finally {
        savingName.value = false
    }
}

</script>