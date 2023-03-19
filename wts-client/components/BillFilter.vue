<template>
    <div>
        <h4>Filter bills</h4>
        <Card>
            <form @submit.prevent="applyFilter()">
            <div class="row mb-2">
                <div class="col-12">
                    <h5>Refine by title</h5>
                    <label for="text_filter">Title must contain the following:</label>
                    <input v-model="filterSettings.titleContains" class="form-control" type="input"
                            id="text_filter">
                    <small class="text-muted">For less strict textual search, you may wish to use the site-wide search function.</small>
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
                    <small><strong>OR</strong>: Bills must be any of the selected type to be shown.</small>
                </div>
                <!--
                <div class="col-12 col-xl-3">
                    <h5>Members of Parliament</h5>
                    <PersonMultiSelect></PersonMultiSelect>
                    <small><strong>OR</strong>: Bills must be sponsored by any one of these MPs to be shown.</small>
                </div>
                -->
                <div class="col-12 col-xl-3">
                    <h5>Temporal characteristics</h5>
                    <label for="parliament_select">Parliamentary term of introduction</label>
                    <select v-model="filterSettings.parliamentaryTerm" class="form-select" id="parliament_select"
                        aria-label="-">
                        <option value="" selected>Any</option>
                        <option value="53">53rd Parliament</option>
                        <option value="52">52nd Parliament</option>
                        <option value="51">51st Parliament</option>
                        <option value="50">50th Parliament</option>
                    </select>

                </div>
                <div class="col-12 col-xl-3">
                    <h5>Procedural characteristics</h5>
                    <div class="form-check">
                        <input v-model="filterSettings.characteristics.urgencyUsed" class="form-check-input" type="checkbox"
                            value="" id="check_urgency">
                        <label class="form-check-label" for="check_urgency">
                            Urgency used
                        </label>
                    </div>
                    <div class="form-check">
                        <input v-model="filterSettings.characteristics.extendedSittingsUsed" class="form-check-input"
                            type="checkbox" value="" id="check_extended">
                        <label class="form-check-label" for="check_extended">
                            Extended sittings used
                        </label>
                    </div>
                    <div class="form-check">
                        <input v-model="filterSettings.characteristics.submissionsOpen" class="form-check-input"
                            type="checkbox" value="" id="check_submissions_open">
                        <label class="form-check-label" for="check_submissions_open">
                            Open for submissions
                        </label>
                    </div>
                    <label for="voting_method_select" class="mt-2">Voting method</label>
                    <select v-model="filterSettings.characteristics.votingMethod" class="form-select"
                        id="voting_method_select" aria-label="Voting method">
                        <option value="" selected>Any</option>
                        <option value="per">Personal voting used</option>
                        <option value="par">Party voting used</option>
                    </select>
                    <small><strong>AND</strong>: Bills must meet all of these criteria to be shown.</small>
                </div>
            </div>
            <hr>
            <h5>Display options</h5>
            <div class="row">
                <div class="col-12 col-xl-3">
                    <label for="per_page_select">Results per page</label>
                    <select v-model="filterSettings.format.perPage" class="form-select" id="per_page_select" aria-label="Results per page">
                        <option value="10" selected>10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <div class="col-12 col-xl-3">
                    <label for="order_by_select">Order by</label>
                    <select v-model="filterSettings.format.orderBy" class="form-select" id="order_by_select" aria-label="Order by">
                        <option value="date_modified_desc" selected>Date modified (newest first)</option>
                        <option value="date_modified_asc">Date modified (oldest first)</option>
                        <option value="introduction_date_desc">Introduction date (newest first)</option>
                        <option value="introduction_date_asc">Introduction date (oldest first)</option>
                        <option value="progress_desc">Status (later stages first)</option>
                        <option value="progress_asc">Status (early stages first)</option>
                    </select>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-12">
                    <button v-if="(activeString != userString) && !isLoading" @click="applyFilter()" class="btn btn-primary" type="button"
                    id="button-addon2">Refine selection</button>
                    <button v-else disabled class="btn btn-primary" type="button"
                    id="button-addon2">Refine selection</button>
                    <Spinner v-if="isLoading" class="ms-2"></Spinner>
                </div>
                
            </div>
        </form>
        </Card>
        <span id="results-marker"></span>
        <div v-if="page">
            <h4>Results</h4>
            {{ count }} result<span v-if="count != 1">s</span>.
            <Card v-for="bill in bills" :key="bill.id">
                <h6 class="mb-0">{{ bill.name }}</h6>
                <small class="text-muted text-uppercase">{{ bill.type_desc }}</small>
            </Card>
            <nav v-if="!isLoading" aria-label="bills_pagination">
                <ul class="pagination mb-1">
                    <li class="page-item" :class="{ disabled: !previous }">
                        <a class="page-link" href="#results-marker" @click="getPage(page - 1)">Previous</a>
                    </li>
                    <li class="page-item" v-if="previous"><a class="page-link" href="#results-marker"
                            @click="getPage(page + 1)">{{ page - 1
                            }}</a></li>
                    <li class="page-item active" aria-current="page">
                        <a class="page-link" href="#results-marker" @click="getPage(page)">{{ page }}</a>
                    </li>
                    <li class="page-item" v-if="next"><a class="page-link" href="#results-marker"
                            @click="getPage(page + 1)">{{ page + 1 }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: !next }">
                        <a class="page-link" href="#results-marker" @click="getPage(page + 1)">Next</a>
                    </li>
                </ul>
                <a @click="getPage(1)" id="back-to-start" href="#results-marker" v-if="page != 1"><small>Back to
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
button, select {
    border-radius: var(--wts-card-border-radius);
}
</style>



<script>
import { API_BASE } from '~~/stores/config';

export default {
    name: 'BillFilter',
    data() {
        return {
            bills: [],
            count: 0,
            page: 1,
            previous: false,
            next: false,
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
                    votingMethod: ""
                },
                format: {
                    perPage: 10,
                    orderBy: "date_modified_desc"
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
                    votingMethod: ""
                },
                format: {
                    perPage: 10,
                    orderBy: "date_modified_desc"
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
        }
    },
    methods: {
        async getPage(page) {
            this.isLoading = true;
            var url = API_BASE + 'bills/?'
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
            this.bills = r.results
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
        }
    },
    onMounted() {
        this.getPage(1)
    }
}

</script>