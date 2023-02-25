export const API_BASE = 'http://0.0.0.0:8000/api/'

import algoliasearch from 'algoliasearch/lite'
export const SEARCH_CLIENT = algoliasearch(
    'CRQORWX9YD',
    '0ba096387d4ce562803bec690404e72b'
)