<template>
    <div>
        <PageHeader
            :pageTitle="displayBill.title"
            :pageSubtitle="billTypeLabel"
            :pageDate="displayBill.introducedDate"
            :colour="displayBill.headerColour"
        />
        <NuxtPage :bill="displayBill" :status="status" :error="error" :refresh="refresh" />
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const billKey = computed(() => `bill-${route.params.id}`)
const { data: bill, status, error, refresh } = await useAsyncData(
    billKey,
    () => $fetch(`${apiBase}bills/${route.params.id}/`),
    { lazy: true }
)

const exampleBill = {
    title: 'Anzac Day Amendment Bill',
    type: 'government',
    introducedDate: '2025-04-03',
    headerColour: '#58787f',
    summary:
        'This bill amends the Anzac Day Act 1966 to cover other conflicts and persons who have served New Zealand in time of war or in warlike conflicts in the past and in the future that are not currently covered by the Act.',
    status: 'in_progress',
    statusSummary:
        'This Bill passed its first reading on 3 April 2025. The Select Committee report was due back on 2 October 2025 and the Bill is awaiting its second reading. Public submissions were due on 21 May 2025.',
    resources: {
        billText: {
            label: 'Anzac Day Amendment Bill (legislation.govt.nz)',
            url: 'https://www.legislation.govt.nz/bill/government/2025/0010/latest/LMS000000.html'
        },
        parliament: {
            label: 'View on Parliament website',
            url: 'https://www.parliament.nz/en/pb/bills-and-laws/bills-proposed-laws/document/00DBHOH_BILL00000000000000/anzac-day-amendment-bill'
        },
        json: {
            label: 'JSON',
            url: 'https://api.wheretheystand.nz/v2/bills/example/'
        }
    },
    votingMethod: {
        label: 'Party voting',
        description:
            'Parties decided whether or not to support this bill and cast votes on behalf of all their MPs.'
    },
    proceduralNotes: [
        {
            title: 'Urgency used',
            description:
                'This bill was progressed through one or more stages using urgency. Urgency allows the Government to fast-track the legislative process by extending the sitting hours of the House of Representatives and skipping the select committee stage of a bill, and allows bills to pass through more than one stage per sitting day.',
            link: {
                label: 'Learn more about urgency',
                url: 'https://www.parliament.nz/en/visit-and-learn/how-parliament-works/laws-and-bills/what-happens-to-a-bill/'
            }
        },
        {
            title: 'Extended sittings used',
            description:
                'This bill was progressed during one or more extended sittings of the House of Representatives. This enables MPs to meet for longer than normal to consider legislation. It allows bills to pass through more than one stage per sitting day.',
            link: {
                label: 'Learn more about extended sittings',
                url: 'https://www.parliament.nz/en/visit-and-learn/how-parliament-works/parliamentary-business/house-sitting-patterns/'
            }
        }
    ],
    member: {
        name: 'Paul Goldsmith',
        role: 'National List MP',
        avatar: '/images/generic-profile-picture.png',
        link: '/people/paul-goldsmith'
    },
    votes: [
        {
            stage: '1st reading',
            status: 'passed',
            date: '2025-04-03',
            totals: {
                ayes: 68,
                noes: 55,
                abstentions: 0,
                absent: 0
            }
        },
        {
            stage: '2nd reading',
            status: 'not_recorded',
            details: 'This vote has not yet occurred, or is not yet recorded on WhereTheyStand.'
        },
        {
            stage: '3rd reading',
            status: 'not_recorded',
            details: 'This vote has not yet occurred, or is not yet recorded on WhereTheyStand.'
        }
    ],
    votesNote:
        'Only reading votes are shown here; these votes determine whether the Bill progresses through Parliament. Other votes, such as votes on whether to amend parts of the Bill, can be seen in Hansard.',
    lastSynced:
        'Bill details last synced with the Parliament website 17 days ago. (31 December 2025 at 01:49 GMT+13:00)'
}

const displayBill = computed(() => {
    const data = bill.value && typeof bill.value === 'object' ? (bill.value as Record<string, any>) : {}
    return {
        ...exampleBill,
        title: data.name ?? data.title ?? exampleBill.title,
        type: data.type ?? exampleBill.type,
        introducedDate: data.introduced_date ?? data.introducedDate ?? exampleBill.introducedDate,
        status: data.status ?? exampleBill.status,
        statusSummary: data.status_summary ?? exampleBill.statusSummary,
        summary: data.summary ?? data.description ?? exampleBill.summary,
        member: data.member ?? exampleBill.member
    }
})

const billTypeLabel = computed(() => {
    const types = config.public.valueKeys?.billTypes ?? {}
    const typeKey = displayBill.value.type
    return (types as Record<string, { description?: string }>)[typeKey]?.description ?? String(typeKey)
})
</script>
