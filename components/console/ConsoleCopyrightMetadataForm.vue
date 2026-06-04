<script setup lang="ts">
import type { CopyrightMetadataDraft } from '~/types/copyrightMetadata'

const props = defineProps<{
  modelValue: CopyrightMetadataDraft
  licenceItems: { id: string; label: string }[]
  copyrightPartyItems: { id: string; label: string }[]
  pickersLoading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CopyrightMetadataDraft]
}>()

const modeItems = [
  { value: 'existing', label: 'Select existing' },
  { value: 'create', label: 'Create new' },
]

function patch(partial: Partial<CopyrightMetadataDraft>) {
  emit('update:modelValue', { ...props.modelValue, ...partial })
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-md border border-default p-3 space-y-2">
      <p class="text-sm font-medium">Licence</p>
      <UFormField label="Source">
        <USelect
          :model-value="modelValue.licence_mode"
          :items="modeItems"
          value-key="value"
          label-key="label"
          class="w-full max-w-xs"
          @update:model-value="(v: string) => patch({ licence_mode: v as 'existing' | 'create' })"
        />
      </UFormField>
      <UFormField v-if="modelValue.licence_mode === 'existing'" label="Licence">
        <USelectMenu
          :model-value="modelValue.licence_id"
          :items="licenceItems"
          value-key="id"
          label-key="label"
          placeholder="Select licence"
          :loading="pickersLoading"
          class="w-full"
          @update:model-value="(v: string | null) => patch({ licence_id: v })"
        />
      </UFormField>
      <template v-else>
        <UFormField label="Name">
          <UInput
            :model-value="modelValue.licence_create.name"
            placeholder="e.g. Creative Commons Attribution 4.0"
            @update:model-value="
              (v: string) =>
                patch({
                  licence_create: { ...modelValue.licence_create, name: v },
                })
            "
          />
        </UFormField>
        <UFormField label="Licence URL">
          <UInput
            :model-value="modelValue.licence_create.url"
            type="url"
            placeholder="https://…"
            @update:model-value="
              (v: string) =>
                patch({
                  licence_create: { ...modelValue.licence_create, url: v },
                })
            "
          />
        </UFormField>
      </template>
    </div>

    <div class="rounded-md border border-default p-3 space-y-2">
      <p class="text-sm font-medium">Copyright owner</p>
      <UFormField label="Source">
        <USelect
          :model-value="modelValue.copyright_owner_mode"
          :items="modeItems"
          value-key="value"
          label-key="label"
          class="w-full max-w-xs"
          @update:model-value="
            (v: string) => patch({ copyright_owner_mode: v as 'existing' | 'create' })
          "
        />
      </UFormField>
      <UFormField v-if="modelValue.copyright_owner_mode === 'existing'" label="Copyright owner">
        <USelectMenu
          :model-value="modelValue.copyright_owner_id"
          :items="copyrightPartyItems"
          value-key="id"
          label-key="label"
          placeholder="Copyright owner"
          :loading="pickersLoading"
          class="w-full"
          @update:model-value="(v: string | null) => patch({ copyright_owner_id: v })"
        />
      </UFormField>
      <template v-else>
        <UFormField label="Name">
          <UInput
            :model-value="modelValue.copyright_owner_create.name"
            @update:model-value="
              (v: string) =>
                patch({
                  copyright_owner_create: {
                    ...modelValue.copyright_owner_create,
                    name: v,
                  },
                })
            "
          />
        </UFormField>
        <UFormField label="Website URL">
          <UInput
            :model-value="modelValue.copyright_owner_create.url"
            type="url"
            placeholder="https://…"
            @update:model-value="
              (v: string) =>
                patch({
                  copyright_owner_create: {
                    ...modelValue.copyright_owner_create,
                    url: v,
                  },
                })
            "
          />
        </UFormField>
      </template>
    </div>

    <div class="rounded-md border border-default p-3 space-y-2">
      <p class="text-sm font-medium">Licence grantor</p>
      <UFormField label="Source">
        <USelect
          :model-value="modelValue.licence_grantor_mode"
          :items="modeItems"
          value-key="value"
          label-key="label"
          class="w-full max-w-xs"
          @update:model-value="
            (v: string) => patch({ licence_grantor_mode: v as 'existing' | 'create' })
          "
        />
      </UFormField>
      <UFormField
        v-if="modelValue.licence_grantor_mode === 'existing'"
        label="Licence grantor"
      >
        <USelectMenu
          :model-value="modelValue.licence_grantor_id"
          :items="copyrightPartyItems"
          value-key="id"
          label-key="label"
          placeholder="Licence grantor"
          :loading="pickersLoading"
          class="w-full"
          @update:model-value="(v: string | null) => patch({ licence_grantor_id: v })"
        />
      </UFormField>
      <template v-else>
        <UFormField label="Name">
          <UInput
            :model-value="modelValue.licence_grantor_create.name"
            @update:model-value="
              (v: string) =>
                patch({
                  licence_grantor_create: {
                    ...modelValue.licence_grantor_create,
                    name: v,
                  },
                })
            "
          />
        </UFormField>
        <UFormField label="Website URL">
          <UInput
            :model-value="modelValue.licence_grantor_create.url"
            type="url"
            placeholder="https://…"
            @update:model-value="
              (v: string) =>
                patch({
                  licence_grantor_create: {
                    ...modelValue.licence_grantor_create,
                    url: v,
                  },
                })
            "
          />
        </UFormField>
      </template>
    </div>
  </div>
</template>
