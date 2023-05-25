<template>
    <div>
        <PageHeader pageTitle="Your WhereTheyStand account"></PageHeader>
        <ClientOnly>
            <SignOutButton></SignOutButton>
        </ClientOnly>
        <div class="container">
            <ClientOnly placeholder="Loading profile view.">
                <MePage></MePage>
            </ClientOnly>
        </div>
    </div>
</template>

<style scoped></style>