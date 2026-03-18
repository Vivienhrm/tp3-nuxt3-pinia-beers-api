import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface Beer {
    id: number
    name: string
    price: string
    image: string
    rating: {
        average: number
        reviews: number
    }
}

export const useBeersStore = defineStore('beers', () => {
    const beers = ref<Beer[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const favorites = useCookie<number[]>('beers-favorites', { default: () => [] })

    async function fetchBeers() {
        if (beers.value.length > 0) return

        loading.value = true
        error.value = null
        try {
            const data: any = await $fetch('https://api.sampleapis.com/beers/ale')
            beers.value = data
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch'
            console.error('Error fetching beers:', err)
        } finally {
            loading.value = false
        }
    }

    function toggleFavorite(beerId: number) {
        const index = (favorites.value || []).indexOf(beerId)
        if (index === -1) {
            favorites.value = [...(favorites.value || []), beerId]
        } else {
            favorites.value = (favorites.value || []).filter((id: number) => id !== beerId)
        }
    }

    const beersList = computed(() => beers.value)
    const favoriteBeers = computed(() => beers.value.filter((beer) => (favorites.value || []).includes(beer.id)))
    const isFavorite = computed(() => (beerId: number) => (favorites.value || []).includes(beerId))

    return {
        beers,
        favorites,
        loading,
        error,
        fetchBeers,
        toggleFavorite,
        beersList,
        favoriteBeers,
        isFavorite
    }
})
