import React, { useState } from 'react'

const CountryList = ({ filteredCountries }) => {
  const [expandedCountry, setExpandedCountry] = useState(null)

  const handleToggle = (country) => {
    setExpandedCountry(expandedCountry === country ? null : country);
  }

  return (
    <div>
      {filteredCountries.length > 10 ? (
        <p>Too many matches, specify another filter</p>
      ) : (
        <ul>
          {filteredCountries.map((country, index) => (
            <li key={index}>
              {country.name.common}
              <button onClick={() => handleToggle(country.name.common)}>Show</button>
              {expandedCountry === country.name.common && (
                <div>
                  <p>Capital: {country.capital}</p>
                  <p>Area: {country.area} </p>
                  <p>Languages: {Object.values(country.languages).join(', ')}</p>
                  <img src={country.flags.svg} alt={`Flag of ${country.name.common}`} width="100" />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CountryList













