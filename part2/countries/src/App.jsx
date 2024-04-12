import React, { useState, useEffect } from 'react'
import axios from 'axios'
import CountryList from './components/CountryList'

function App() {
  const [query, setQuery] = useState('')
  const [allCountries, setAllCountries] = useState([])
  const [filteredCountries, setFilteredCountries] = useState([])

  useEffect(() => {
    axios.get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setAllCountries(response.data)
      })
      .catch(error => {
        console.error('Error fetching countries:', error)
      })
  }, [])

  useEffect(() => {
    if (query) {
      const filtered = allCountries.filter(country =>
        country.name.common.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredCountries(filtered)
    } else {
      setFilteredCountries([])
    }
  }, [query])

  const handleQueryChange = (event) => {
    setQuery(event.target.value)
  }

  return (
    <div>
      find countries
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        placeholder="Search for a country..."
      />
      <CountryList filteredCountries={filteredCountries} />
    </div>
  )
}

export default App

