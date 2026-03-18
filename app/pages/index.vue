<script setup lang="ts">
import { useBeersStore } from '~/store/store'
import type { Beer } from '~/store/store'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

const beersStore = useBeersStore()
const { fetchBeers, toggleFavorite } = beersStore
const { beersList, loading, error, isFavorite } = storeToRefs(beersStore)

await fetchBeers()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 8

const filteredBeers = computed(() => {
  let result = beersList.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((beer: Beer) => 
      beer.name.toLowerCase().includes(query)
    )
  }
  return result
})

const paginatedBeers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredBeers.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredBeers.value.length / pageSize))

const showFavorites = ref(false)

const displayedBeers = computed(() => {
  if (showFavorites.value) {
    return beersList.value.filter((b: Beer) => isFavorite.value(b.id))
  }
  return paginatedBeers.value
})

const updatePage = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <div class="container">
    <header class="header">
      <h1>Brewery Explorer</h1>
      <div class="controls">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search for a beer..." 
            @input="currentPage = 1"
          />
        </div>
        <button class="btn-toggle" @click="showFavorites = !showFavorites">
          {{ showFavorites ? 'All Beers' : 'My Favorites' }}
        </button>
      </div>
    </header>

    <main>
      <div v-if="error" class="error-banner">
        <p>⚠️ Error: {{ error }}</p>
        <button @click="fetchBeers">Retry</button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading beers...</p>
      </div>
      <div v-if="showFavorites && displayedBeers.length === 0" class="empty-state">
        <p>You haven't added any favorites yet!</p>
      </div>

      <div v-else class="beer-grid">
        <div v-for="beer in displayedBeers" :key="beer.id" class="beer-card">
          <div class="image-container">
            <img :src="beer.image" :alt="beer.name" loading="lazy" />
            <button 
              class="fav-btn" 
              :class="{ 'is-fav': isFavorite(beer.id) }"
              @click="toggleFavorite(beer.id)"
            >
              ❤️
            </button>
          </div>
          <div class="beer-info">
            <h3>{{ beer.name }}</h3>
            <div class="beer-meta">
              <span class="price">{{ beer.price }}</span>
              <span class="rating">⭐ {{ beer.rating.average.toFixed(1) }} ({{ beer.rating.reviews }})</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!showFavorites && totalPages > 1" class="pagination">
        <button 
          :disabled="currentPage === 1" 
          @click="updatePage(currentPage - 1)"
        >
          Previous
        </button>
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages" 
          @click="updatePage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #fff;
  min-height: 100vh;
  background: radial-gradient(circle at top left, #1a1a2e, #16213e);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box input {
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  width: 300px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.search-box input:focus {
  outline: none;
  border-color: #4facfe;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 15px rgba(79, 172, 254, 0.3);
}

.btn-toggle {
  padding: 0.8rem 1.5rem;
  border-radius: 30px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(118, 75, 162, 0.4);
}

.beer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.beer-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.beer-card:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.image-container {
  position: relative;
  height: 200px;
  background: #fdfdfd11;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.image-container img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  filter: grayscale(1);
  transition: filter 0.3s, transform 0.2s;
}

.fav-btn:hover {
  transform: scale(1.2);
}

.fav-btn.is-fav {
  filter: grayscale(0);
}

.beer-info {
  padding: 1.5rem;
}

.beer-info h3 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.beer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.price {
  font-weight: 700;
  color: #4facfe;
}

.rating {
  color: #ffd700;
}

.pagination {
  margin-top: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding-bottom: 2rem;
}

.pagination button {
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4facfe;
}

.pagination button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
}

.loading-state, .error-banner, .empty-state {
  text-align: center;
  padding: 5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  margin-top: 2rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-top-color: #4facfe;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-banner {
  border: 1px solid #ff4b2b;
  background: rgba(255, 75, 43, 0.1);
}

.error-banner button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #ff4b2b;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}
</style>
