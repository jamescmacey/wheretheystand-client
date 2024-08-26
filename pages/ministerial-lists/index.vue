<template>
    <div>
        <PageHeader pageTitle="Ministerial Lists"></PageHeader>
        <div class="container">
            <div class="row mt-3">
                <div class="col-12">
                    <h4>The Ministerial List outlines the responsibilities of each Minister and Parliamentary
                        Under-Secretary.</h4>
                    <p>Each list is dated and is updated when a change in portfolio assignment occurs. Only the most recent
                        version of the Ministerial List is available on the website of the Department of the Prime Minister
                        and Cabinet, but WhereTheyStand holds Ministerial Lists dating back to 20xx.</p>
                    <ExternalLinkButton
                        link="https://www.dpmc.govt.nz/our-business-units/cabinet-office/ministers-and-their-portfolios/ministerial-list"
                        text="Ministerial List (DPMC and Cabinet Office)"></ExternalLinkButton>
                    <Card>
                        <h5>Ministerial List, 10 May 2023</h5>
                        <h6>Cabinet Ministers</h6>
                        <div v-for="minister in cabinet_ministers" :key="minister.cabinet_ranking">
                        <strong>{{ minister.cabinet_ranking }}</strong> {{ minister.person.display_name }}
                        <div class="row">
                            <div class="col-lg-6 col-12">
                                <ul>
                                    <li v-for="r in minister.ministerial_portfolios">{{ r }}</li>
                                </ul>
                            </div>
                            <div class="col-lg-6 col-12">
                                <ul>
                                    <li v-for="r in minister.other_responsibilities">{{ r }}</li>
                                </ul>
                            </div>
                        </div>
                        </div>
                        <h6>Ministers </h6>

                    </Card>
                    <p class="text-muted">Some lists have been obtained under the Official Information Act 1982. The PDF
                        file of each Ministerial List is licensed by the Department of the Prime Minister and Cabinet for
                        re-use under the <ExternalLinkInline link="https://creativecommons.org/licenses/by/4.0/">Creative
                            Commons Attribution 4.0 International licence</ExternalLinkInline>.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useGroupsStore } from '../../stores/groups'




export default {
    name: "MinisterialLists",
    setup() {
        const groupsStore = useGroupsStore();
        return { groupsStore };
    },
    data() {
        return {
            activeList: {
                "list_date": "2023-05-10",
                "file": {
                    id: 35,
                    url: "https://storage.googleapis."
                },
                "people": [
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                    {
                        "list_section": "cabinet_ministers",
                        "cabinet_ranking": 1,
                        "person": {
                            display_name: "Chris Hipkins",
                            first_name: "Chris",
                            last_name: "Hipkins",
                            slug: "chris-hipkins",
                        },
                        "ministerial_portfolios": [
                            "Prime Minister",
                            "Minister for National Security and Intelligence"
                        ],
                        "other_responsibilities": [
                            "Minister Responsible for Ministerial Services"
                        ]
                    },
                ]
            }
        }
    },
    created() {
        //this.groupsStore.fetchElectorates("allCurrent");
    },
    computed: {
        cabinet_ministers() {
            return (this.activeList.people).filter(person => {
                if (person.list_section == "cabinet_ministers") {
                    return true
                }
            }).sort((a, b) => {
                if (a.cabinet_ranking < a.cabinet_ranking) {
                    return -1;
                }
                return 1;
            });
        }
    }
}
</script>