<template>
    <div>
        <h4>Filter votes</h4>

        <Head v-if="prefetchData && prefetchData.count && (prefetchData.count > 0)">
            <Link v-if="prefetchData.previous && (prefetchData.page == 2)" rel="prev" href="/votes">
            </Link>
            <Link v-if="prefetchData.previous && (prefetchData.page != 2)" rel="prev"
                :href="'/votes?page=' + (prefetchData.page - 1)">
            </Link>
            <Link v-if="prefetchData.next" rel="next" :href="'/votes?page=' + (prefetchData.page + 1)">
            </Link>
        </Head>
        <Card>
            <form @submit.prevent="applyFilter()">
                <div class="row mb-2">
                    <div class="col-12">
                        <h5>Refine by bill title</h5>
                        <label for="text_filter">Bill title must contain the following:</label>
                        <input v-model="filterSettings.titleContains" class="form-control" type="input" id="text_filter">
                        <small class="text-muted">For less strict textual search, you may wish to use the site-wide search
                            function.</small>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-12 col-xl-3">
                        <h5>Bill types</h5>
                        <div class="form-check">
                            <input v-model="filterSettings.billTypes.gov" class="form-check-input" type="checkbox" value=""
                                id="check_goverment">
                            <label class="form-check-label" for="check_goverment">
                                Government bills
                            </label>
                        </div>
                        <div class="form-check">
                            <input v-model="filterSettings.billTypes.mem" class="form-check-input" type="checkbox" value=""
                                id="check_members">
                            <label class="form-check-label" for="check_members">
                                Members' bills
                            </label>
                        </div>
                        <div class="form-check">
                            <input v-model="filterSettings.billTypes.loc" class="form-check-input" type="checkbox" value=""
                                id="check_local">
                            <label class="form-check-label" for="check_local">
                                Local bills
                            </label>
                        </div>
                        <div class="form-check">
                            <input v-model="filterSettings.billTypes.pri" class="form-check-input" type="checkbox" value=""
                                id="check_private">
                            <label class="form-check-label" for="check_private">
                                Private bills
                            </label>
                        </div>
                        <small><strong>OR</strong>: Votes must be for a bill of one of the selected types to be
                            shown.</small>
                    </div>
                    <div class="col-12 col-xl-3">
                        <h5>Vote options</h5>
                        <label for="parliament_select">Parliamentary term</label>
                        <select v-model="filterSettings.parliamentaryTerm" class="form-select" id="parliament_select"
                            aria-label="-">
                            <option value="" selected>Any</option>
                            <option value="54">54th Parliament</option>
                            <option value="53">53rd Parliament</option>
                            <option value="52">52nd Parliament</option>
                            <option value="51">51st Parliament</option>
                            <option value="50">50th Parliament</option>
                        </select>
                        <label for="vote_type_select" class="mt-2">Vote type</label>
                        <select v-model="filterSettings.characteristics.type" class="form-select" id="vote_type_select"
                            aria-label="Vote type">
                            <option value="" selected>Any</option>
                            <option value="personal">Personal vote</option>
                            <option value="party">Party vote</option>
                        </select>
                        <small><strong>AND</strong>: Votes must meet both of these criteria to be shown.</small>

                    </div>
                    <div class="col-12 col-xl-3">
                        <h5>Display options</h5>
                        <label for="per_page_select">Results per page</label>
                        <select v-model="filterSettings.format.perPage" class="form-select" id="per_page_select"
                            aria-label="Results per page">
                            <option value="10" selected>10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <label for="order_by_select" class="mt-2">Order by</label>
                        <select v-model="filterSettings.format.orderBy" class="form-select" id="order_by_select"
                            aria-label="Order by">
                            <option value="date_desc" selected>Date (newest first)</option>
                            <option value="date_asc">Date (oldest first)</option>
                            <option value="reading_desc">Reading (latest first)</option>
                            <option value="reading_asc">Reading (earliest first)</option>
                        </select>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-12">
                        <button v-if="(activeString != userString) && !isLoading" @click="applyFilter()"
                            class="btn btn-primary" type="button" id="button-addon2">Refine selection</button>
                        <button v-else disabled class="btn btn-primary" type="button" id="button-addon2">Refine
                            selection</button>
                        <Spinner v-if="isLoading" class="ms-2"></Spinner>
                    </div>

                </div>
            </form>
        </Card>
        <span id="results-marker"></span>
        <div v-if="page">
            <h4>Results</h4>
            {{ displayCount }} result<span v-if="displayCount != 1">s</span>.
            <NuxtLink :title="vote.name" v-for="vote in displayVotes" :key="vote.id" :to="'/votes/' + vote.id"
                class="vote-link">
                <Card>
                    <div class="row">
                        <div class="col-12 col-xl-5">
                            <h6 class="mb-0">{{ vote.name }}</h6>
                            <small class="me-1">
                                <span v-if="vote.type_desc" class="badge bg-primary text-uppercase">{{ vote.type_desc
                                }}</span>
                            </small>
                            <small class="text-muted text-uppercase">{{ formattedDateFull(vote.date) }}</small>
                            <hr class="col-12 d-xl-none mt-2">
                        </div>
                        <div class="col-12 col-xl-7">
                            <div class="row">
                                <div class="col-3 text-center">
                                    <h3>{{ vote.ayes }}</h3>
                                    <h6 class="text-muted text-uppercase"><span class="dot-yes"></span> Ayes</h6>
                                </div>
                                <div class="col-3 text-center">
                                    <h3>{{ vote.noes }}</h3>
                                    <h6 class="text-muted text-uppercase"><span class="dot-no"></span> Noes</h6>
                                </div>
                                <div class="col-3 text-center">
                                    <h3>{{ vote.abstentions }}</h3>
                                    <h6 class="text-muted text-uppercase"><span class="dot-abstain"></span> Abstentions</h6>
                                </div>
                                <div class="col-3 text-center">
                                    <h3>{{ vote.absent }}</h3>
                                    <h6 class="text-muted text-uppercase"><span class="dot-absent"></span> Absent</h6>
                                </div>
                            </div>
                        </div>
                    </div>

                </Card>
            </NuxtLink>

            <nav v-if="!isLoading && !hasLoadedData && prefetchData && (displayCount > 1)" aria-label="votes_pagination">
                <ul class="pagination mb-1">
                    <li class="page-item" :class="{ disabled: !displayPrevious }">
                        <a class="page-link" href="#results-marker" @click="getPage(displayPage - 1)">Previous</a>
                    </li>
                    <li class="page-item" v-if="displayPrevious"><a class="page-link" href="#results-marker"
                            @click="getPage(displayPage - 1)">{{ displayPage - 1
                            }}</a></li>
                    <li class="page-item active" aria-current="page">
                        <a class="page-link" href="#results-marker" @click="getPage(displayPage)">{{ displayPage }}</a>
                    </li>
                    <li class="page-item" v-if="displayNext"><a class="page-link" href="#results-marker"
                            @click="getPage(displayPage + 1)">{{ displayPage + 1 }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: !displayNext }">
                        <a class="page-link" href="#results-marker" @click="getPage(displayPage + 1)">Next</a>
                    </li>
                </ul>
                <a @click="getPage(1)" id="back-to-start" href="#results-marker" v-if="displayPage != 1"><small>Back to
                        start</small></a>
            </nav>

            <nav v-if="!isLoading && hasLoadedData && (displayCount > 1)" aria-label="votes_pagination">
                <ul class="pagination mb-1">
                    <li class="page-item" :class="{ disabled: !displayPrevious }">
                        <a class="page-link" href="#results-marker" @click="getPage(displayPage - 1)">Previous</a>
                    </li>
                    <li class="page-item" v-if="displayPrevious"><a class="page-link" href="#results-marker"
                            @click="getPage(displayPage - 1)">{{ displayPage - 1
                            }}</a></li>
                    <li class="page-item active" aria-current="page">
                        <a class="page-link" href="#results-marker" @click="getPage(displayPage)">{{ displayPage }}</a>
                    </li>
                    <li class="page-item" v-if="displayNext"><a class="page-link" href="#results-marker"
                            @click="getPage(displayPage + 1)">{{ displayPage + 1 }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: !displayNext }">
                        <a class="page-link" href="#results-marker" @click="getPage(displayPage + 1)">Next</a>
                    </li>
                </ul>
                <a @click="getPage(1)" id="back-to-start" href="#results-marker" v-if="displayPage != 1"><small>Back to
                        start</small></a>
            </nav>

        </div>
    </div>
</template>

<style scoped>
#back-to-start {
    text-decoration: none
}

#back-to-start:hover {
    text-decoration: underline
}

input,
button,
select {
    border-radius: var(--wts-card-border-radius);
}

.vote-link {
    color: inherit;
    text-decoration: inherit;
}
</style>


<script>
import { API_BASE } from '~~/stores/config';
import { parse, format, formatDistanceToNow } from 'date-fns'
import { useRoute } from 'vue-router';

export default {
    async setup() {
        const query = useRoute().query;
        var initialPage = 1
        if (query.hasOwnProperty('page')) {
            initialPage = query.page
        }

        const { data: prefetchData } = await useFetch(
            API_BASE + 'votes/?page=' + initialPage + '&per_page=10'
        )

        return {prefetchData: prefetchData}
    },
    name: 'VoteFilter',
    data() {
        return {
            votes: [],
            count: 0,
            page: 1,
            previous: false,
            next: false,
            hasLoadedData: false,
            isLoading: false,
            filterSettings: {
                titleContains: "",
                billTypes: {
                    mem: true,
                    gov: true,
                    pri: true,
                    loc: true
                },
                parliamentaryTerm: "",
                characteristics: {
                    urgencyUsed: false,
                    extendedSittingsUsed: false,
                    submissionsOpen: false,
                    votingMethod: "",
                    type: ""
                },
                format: {
                    perPage: 10,
                    orderBy: "date_desc"
                }
            },
            activeFilter: {
                titleContains: "",
                billTypes: {
                    mem: true,
                    gov: true,
                    pri: true,
                    loc: true
                },
                parliamentaryTerm: "",
                characteristics: {
                    urgencyUsed: false,
                    extendedSittingsUsed: false,
                    submissionsOpen: false,
                    votingMethod: "",
                    type: ""
                },
                format: {
                    perPage: 10,
                    orderBy: "date_desc"
                }
            }
        }
    },
    computed: {
        activeString() {
            return JSON.stringify(this.activeFilter)
        },
        userString() {
            return JSON.stringify(this.filterSettings)
        },
        displayVotes() {
            if (!this.hasLoadedData && this.prefetchData) {
                return this.prefetchData.results
            } else {
                return this.votes
            }
        },
        displayCount() {
            if (!this.hasLoadedData && this.prefetchData) {
                return this.prefetchData.count
            } else {
                return this.count
            }
        },
        displayPage() {
            if (!this.hasLoadedData && this.prefetchData) {
                return this.prefetchData.page
            } else {
                return this.page
            }
        },
        displayNext() {
            if (!this.hasLoadedData && this.prefetchData) {
                return this.prefetchData.next
            } else {
                return this.next
            }
        },
        displayPrevious() {
            if (!this.hasLoadedData && this.prefetchData) {
                return this.prefetchData.previous
            } else {
                return this.previous
            }
        }
    },
    methods: {
        async getPage(page) {
            this.isLoading = true;
            var url = API_BASE + 'votes/?'
            var r = await $fetch(url + new URLSearchParams({
                page: page,
                per_page: this.activeFilter.format.perPage
            }), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    page: page,
                    filter: this.activeFilter
                }),
            })

            this.isLoading = false;
            this.hasLoadedData = true;
            this.votes = r.results
            this.count = r.count
            if (r.previous) {
                this.previous = true
            } else {
                this.previous = false
            }

            if (r.next) {
                this.next = true
            } else {
                this.next = false
            }
            this.page = page

        },
        applyFilter() {
            if ((this.activeString != this.userString) && !this.isLoading) {
                this.activeFilter = JSON.parse(JSON.stringify(this.filterSettings))
                this.getPage(1)
            }
        },
        relativeDate(date) {
            return formatDistanceToNow(parse(date, 'yyyy-MM-dd', new Date())) + " ago"
        },
        formattedDate(date) {
            return format(parse(date, 'yyyy-MM-dd', new Date()), 'd.M.yyyy')
        },
        formattedDateFull(date) {
            return format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
        }
    }
}

</script>