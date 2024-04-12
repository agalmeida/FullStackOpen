import React from 'react'
import personService from '../services/persons'

const PersonList =({persons, setPersons, setNotificationMessage}) => {
    const removePerson = (id, name) => {
        if (window.confirm(`Delete ${name}?`)) {
          personService
            .remove(id)
            .then(() => {
              setPersons(persons.filter(person => person.id !== id))
              setNotificationMessage(
                `Deleted ${name} from phonebook`
              )
              setTimeout(() => {
                setNotificationMessage(null)
              }, 5000)
            })
            .catch(error => {
              console.error('Error deleting person:', error)
            })
        }
      }
   
    return (
        <ul>
            {persons.map((person) => (
            <li key={person.id}>
                {person.name} {person.number}
                <button onClick={() => removePerson(person.id, person.name)}>Delete</button>
            </li>
            ))}
        </ul>        
    )
}

export default PersonList