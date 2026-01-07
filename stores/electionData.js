import { defineStore } from 'pinia'

// Helper function to create a key from election and results version slugs
const createReferenceDataKey = (electionSlug, resultsVersionSlug) => {
    return `${electionSlug}::${resultsVersionSlug}`
}

export const useElectionDataStore = defineStore('electionData', {
    state: () => ({
        persistentData: null,
        referenceData: {},
        results: {},
        status: {
            persistentDataLoaded: false,
            referenceDataLoaded: {},
            resultsDataLoaded: {}
        },
        computedElectorateResults: {},
    }),

    getters: {
        /**
         * Get persistent data
         */
        getPersistentData: (state) => state.persistentData,

        /**
         * Get reference data for a specific election and results version
         */
        getReferenceData: (state) => (electionSlug, resultsVersionSlug) => {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            return state.referenceData[key] || null
        },

        /**
         * Get results data for a specific election and results version
         * Returns an array of results sets
         * Includes optional filters for each result set:
         * - results_level
         * - results_category
         * - electorate 
         * - voting_place
         * - result_number
         * Each filter value can be a single value or an array of allowed values.
         */
        getResultsData: (state) => (electionSlug, resultsVersionSlug, filters = {}) => {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            const resultSets = state.results[key] || []
            if (!resultSets.length || !filters || Object.keys(filters).length === 0) return resultSets

            return resultSets.filter(result => {
                return Object.entries(filters).every(([filterKey, filterValue]) => {
                    // If filterValue is undefined or null, skip the filter for that key
                    if (filterValue === undefined || filterValue === null) return true
                    // If filterValue is an array, check result[filterKey] is in the array
                    if (Array.isArray(filterValue)) {
                        console.log(filterValue)
                        console.log(result[filterKey])
                        return filterValue.includes(result[filterKey])
                    }
                    // Otherwise, do a direct comparison
                    return result[filterKey] === filterValue
                })
            })
        },

        getComputedElectorateResults: (state) => (electionSlug, resultsVersionSlug) => {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            return state.computedElectorateResults[key] || {}
        },

        /**
         * Check if persistent data is loaded
         */
        isPersistentDataLoaded: (state) => state.status.persistentDataLoaded,

        /**
         * Check if reference data is loaded for a specific election and results version
         */
        isReferenceDataLoaded: (state) => (electionSlug, resultsVersionSlug) => {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            return state.status.referenceDataLoaded[key] || false
        },

        /**
         * Check if results data is loaded for a specific election and results version
         */
        isResultsDataLoaded: (state) => (electionSlug, resultsVersionSlug) => {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            return state.status.resultsDataLoaded[key] || false
        },

        /**
        * Get the party for a specific candidate in a given election and results version, if it exists, providing either candidate.id, candidate.number or the candidate object.
        * @param {string} electionSlug - The election slug
        * @param {string} resultsVersionSlug - The results version slug
        * @param {Object} candidate - The candidate object
        * @return {Object} The party object
        */
        getPartyForCandidate: (state) => (electionSlug, resultsVersionSlug, candidate) => {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)

            if (Object.keys(candidate).includes('party') && candidate.party) {
                return state.referenceData[key].parties.find(party => party.id === candidate.party || party.number === candidate.party)
            } else if (Object.keys(candidate).includes('party')) {
                return null
            } else {
                const fullCandidate = state.referenceData[key].candidates.find(candidateObject => candidateObject.id === candidate.id || candidateObject.number === candidate.number)
                if (fullCandidate && fullCandidate.party) {
                    const party = state.referenceData[key].parties.find(party => party.id === fullCandidate.party || party.number === fullCandidate.party)
                    if (party) {
                        return party
                    }
                }
            }
        },

        /**
        * Get the electorate for a specific candidate in a given election and results version, if it exists, providing either candidate.id, candidate.number or the candidate object.
        * @param {string} electionSlug - The election slug
        * @param {string} resultsVersionSlug - The results version slug
        * @param {Object} candidate - The candidate object
        * @return {Object} The electorate object
        */
        getElectorateForCandidate: (state) => (electionSlug, resultsVersionSlug, candidate) => {
            if (Object.keys(candidate).includes('electorate') && candidate.electorate) {
                return state.referenceData[key].electorates.find(electorate => electorate.id === candidate.electorate || electorate.number === candidate.electorate)
            } else if (Object.keys(candidate).includes('electorate')) {
                return null
            } else {
                const fullCandidate = state.referenceData[key].candidates.find(candidateObject => candidateObject.id === candidate.id || candidateObject.number === candidate.number)
                if (fullCandidate && fullCandidate.electorate) {
                    const electorate = state.referenceData[key].electorates.find(electorate => electorate.id === fullCandidate.electorate || electorate.number === fullCandidate.electorate)
                    if (electorate) {
                        return electorate
                    } else {
                        return null
                    }
                }
            }
        },

        /**
        * Get the party for a specific party in a given election and results version, if it exists, providing either party.id, party.number or the party object.
        * @param {string} electionSlug - The election slug
        * @param {string} resultsVersionSlug - The results version slug
        * @param {Object} party - The party object
        * @return {Object} The party object
        */
        getPartyForParty: (state) => (electionSlug, resultsVersionSlug, party) => {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            return state.referenceData[key].parties.find(partyObject => partyObject.id === party.id || partyObject.number === party.number)
        },

        /**
        * Get the electorate for a specific electorate in a given election and results version, if it exists, providing either electorate.id, electorate.number or the electorate object.
        * @param {string} electionSlug - The election slug
        * @param {string} resultsVersionSlug - The results version slug
        * @param {Object} electorate - The electorate object
        * @return {Object} The electorate object
        */
        getElectorateForElectorate: (state) => (electionSlug, resultsVersionSlug, electorate) => {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            return state.referenceData[key].electorates.find(electorateObject => electorateObject.id === electorate.id || electorateObject.number === electorate.number)
        },

        /**
        * Get the candidate for a specific candidate in a given election and results version, if it exists, providing either candidate.id, candidate.number or the candidate object.
        * @param {string} electionSlug - The election slug
        * @param {string} resultsVersionSlug - The results version slug
        * @param {Object} candidate - The candidate object
        * @return {Object} The candidate object
        */
        getCandidateForCandidate: (state) => (electionSlug, resultsVersionSlug, candidate) => {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            return state.referenceData[key].candidates.find(candidateObject => candidateObject.id === candidate.id || candidateObject.number === candidate.number)
        },

        /**
         * Get the persistent party for a specific party in a given election and results version, if it exists, providing either party.id, party.number or the party object.
         * @param {string} electionSlug - The election slug
         * @param {string} resultsVersionSlug - The results version slug
         * @param {Object} party - The party object
         * @return {Object} The persistent party object
         */
        getPersistentPartyForParty: (state) => (electionSlug, resultsVersionSlug, party) => {
            // We do not have access to "this" inside a Pinia getter,
            // so we have to use only the state.
            if (!party.persistent_party) {
                const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
                party = state.referenceData[key].parties.find(partyObject => partyObject.id === party.id || partyObject.number === party.number)
                if (!party || !party.persistent_party) {
                    return null
                }
            }
            // Now get persistent party from persistentData
            if (!state.persistentData || !state.persistentData.persistent_parties) return null
            return state.persistentData.persistent_parties.find(persistentParty => persistentParty.id === party.persistent_party)
        },

        /**
         * Get the persistent party for a specific candidate in a given election and results version, if it exists, providing either candidate.id, candidate.number or the candidate object.
         * @param {string} electionSlug - The election slug
         * @param {string} resultsVersionSlug - The results version slug
         * @param {Object} candidate - The candidate object
         * @return {Object} The persistent party object
         */
        getPersistentPartyForCandidate: (state) => (electionSlug, resultsVersionSlug, candidate) => {
            // No access to this inside Pinia getters: call other getter manually by logic.
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            const parties = state.referenceData[key]?.parties ?? []
            let referenceParty = null
            // Resolve candidate party reference
            if (Object.keys(candidate).includes('party') && candidate.party) {
                referenceParty = parties.find(party => party.id === candidate.party || party.number === candidate.party)
            } else if (Object.keys(candidate).includes('party')) {
                return null
            } else {
                const fullCandidate = state.referenceData[key].candidates.find(candidateObject => candidateObject.id === candidate.id || candidateObject.number === candidate.number)
                if (fullCandidate && fullCandidate.party) {
                    referenceParty = parties.find(party => party.id === fullCandidate.party || party.number === fullCandidate.party)
                }
            }
            // Now get persistent party
            if (!state.persistentData || !state.persistentData.persistent_parties || !referenceParty) return null
            return state.persistentData.persistent_parties.find(persistentParty => persistentParty.id === referenceParty.persistent_party)
        }
    },

    actions: {
        /**
         * Set persistent data
         * @param {*} data - The persistent data to store
         */
        setPersistentData(data) {
            this.persistentData = data
            this.status.persistentDataLoaded = true
        },

        /**
         * Set reference data for a specific election and results version
         * @param {string} electionSlug - The election slug
         * @param {string} resultsVersionSlug - The results version slug
         * @param {*} data - The reference data to store
         */
        setReferenceData(electionSlug, resultsVersionSlug, data) {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)

            // Before storing the data, sort the candidates by the 'number' attribute in ascending order
            data.candidates.sort((a, b) => a.number - b.number)
            data.parties.sort((a, b) => a.number - b.number)
            data.electorates.sort((a, b) => a.number - b.number)

            this.referenceData[key] = data
            this.status.referenceDataLoaded[key] = true
        },

        /**
         * Update the results for a specific election and results version.
         * For each result in the new data, update the corresponding result in the existing results list
         * by matching against: results_level, results_category, electorate, voting_place, result_number.
         * If a match is found, replace it. If not, append it.
         * @param {string} electionSlug - The election slug
         * @param {string} resultsVersionSlug - The results version slug
         * @param {*} data - The results data to update
         */
        updateResultsData(electionSlug, resultsVersionSlug, data) {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            // Ensure structure
            if (!Array.isArray(data)) {
                this.results[key] = data // fallback to default
                this.status.resultsDataLoaded[key] = true
                return
            }

            // Prepare initial results array if not present
            if (!Array.isArray(this.results[key])) {
                this.results[key] = []
            }

            // Helper function for matching
            function isSameResult(a, b) {
                return (
                    a.results_level === b.results_level &&
                    a.results_category === b.results_category &&
                    a.electorate === b.electorate &&
                    a.voting_place === b.voting_place &&
                    a.result_number === b.result_number
                )
            }

            // Make a shallow clone of the current results
            const currentResults = Array.isArray(this.results[key]) ? [...this.results[key]] : []

            // For each incoming result: update if exists, else add
            data.forEach(newResult => {
                // First sort the results inside the newResult by count to speed things up in other parts of the app
                newResult.results.sort((a, b) => b.count - a.count)

                const idx = currentResults.findIndex(existing =>
                    isSameResult(existing, newResult)
                )
                if (idx !== -1) {
                    currentResults[idx] = newResult
                } else {
                    currentResults.push(newResult)
                }

                // If this is an electorate result, update the computed electorate results
                if (newResult.results_level === 'electorate' && newResult.results_category === 'candidate_votes') {

                    let computedResult = null
                    if (newResult.results.length < 2) {
                        computedResult = {
                            electorate: newResult.electorate,
                            resultStatus: 'defaulted',
                            firstPlace: newResult.results[0].candidate,
                            secondPlace: null,
                            margin: null,
                            margin_percentage: null
                        }
                    } else if (newResult.results.length === 0) {
                        computedResult = {
                            electorate: newResult.electorate,
                            resultStatus: 'no_candidates',
                            firstPlace: null,
                            secondPlace: null,
                            margin: null,
                            margin_percentage: null
                        }
                    } else {
                        const firstPlace = newResult.results[0]
                        const secondPlace = newResult.results[1]

                        if (firstPlace.count === secondPlace.count) {
                            computedResult = {
                                electorate: newResult.electorate,
                                resultStatus: 'indeterminate',
                                firstPlace: firstPlace.candidate,
                                secondPlace: secondPlace.candidate,
                                margin: 0,
                                margin_percentage: 0
                            }
                        } else {
                            computedResult = {
                                electorate: newResult.electorate,
                                resultStatus: 'determined',
                                firstPlace: firstPlace.candidate,
                                secondPlace: secondPlace.candidate,
                                margin: firstPlace.count - secondPlace.count,
                                margin_percentage: firstPlace.per_cent - secondPlace.per_cent
                            }
                        }

                    }

                    if (computedResult) {
                        if (!this.computedElectorateResults[key]) {
                            this.computedElectorateResults[key] = {}
                        }
                        this.computedElectorateResults[key][newResult.electorate] = computedResult
                    }
                }
            })

            this.results[key] = currentResults
            this.status.resultsDataLoaded[key] = true
        },

        /**
         * Clear persistent data
         */
        clearPersistentData() {
            this.persistentData = null
            this.status.persistentDataLoaded = false
        },

        /**
         * Clear reference data for a specific election and results version
         * @param {string} electionSlug - The election slug
         * @param {string} resultsVersionSlug - The results version slug
         */
        clearReferenceData(electionSlug, resultsVersionSlug) {
            const key = createReferenceDataKey(electionSlug, resultsVersionSlug)
            delete this.referenceData[key]
            delete this.status.referenceDataLoaded[key]
        },

        /**
         * Clear all reference data
         */
        clearAllReferenceData() {
            this.referenceData = {}
            this.status.referenceDataLoaded = {}
        },

        /**
         * Clear all results data
         */
        clearAllResultsData() {
            this.results = {}
            this.status.resultsDataLoaded = {}
        },

        /**
         * Clear all data
         */
        clearAll() {
            this.clearPersistentData()
            this.clearAllReferenceData()
            this.clearAllResultsData()
        }
    }
})
