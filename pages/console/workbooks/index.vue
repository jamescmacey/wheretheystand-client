<script setup lang="ts">
</script>

<template>
  <UContainer class="py-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <h1 class="text-2xl font-bold">
        Workbooks
      </h1>
      <UButton
        to="/console/workbooks/new"
        icon="i-lucide-plus"
        label="New workbook"
      />
    </div>

    <ConsoleWorkbookListSection
      title="My workbooks"
      description="Workbooks you own."
      query-prefix="mine"
      scope="mine"
      empty-title="You have no workbooks yet"
    />

    <ConsoleWorkbookListSection
      title="System workbooks"
      description="Shared workbooks with no assigned owner."
      query-prefix="system"
      scope="system"
      empty-title="No system workbooks"
    />
  </UContainer>
</template>
