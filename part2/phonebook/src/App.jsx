import { useEffect, useState } from 'react'
import axios from 'axios'
import Filter from './components/Filter'
import PersonList from './components/PersonList'
import PersonForm from './components/PersonForm'
import personService from './services/persons'
import Notification from './components/Notifcation'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const addPerson = (event) =>{
    event.preventDefault()
    const existingPerson = persons.find(person =>person.name === newName)

    if(existingPerson){
      if(window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        console.log(existingPerson.id)
        const updatedPerson = { ...existingPerson, number: newNumber }
        personService
          .update(String(existingPerson.id), updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== existingPerson.id ? person : returnedPerson))
            setNotificationMessage(
              `Altered ${updatedPerson.name}'s number`
            )
            setTimeout(() => {
              setNotificationMessage(null)
            }, 5000)
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            setNotificationMessage(
              `Information of ${updatedPerson.name} has already been removed from server`
            )
            setTimeout(() => {
              setNotificationMessage(null)
            }, 5000)
          })
      }
    }else{
      const personObject = {
        name: newName,
        number: newNumber,
        id: String(newId)
      }
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
        })
      setNotificationMessage(
        `Added ${personObject.name}`
      )
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
      setNewName('')
      setNewNumber('')
    }
  }
  
  const newId = Math.max(...persons.map(person => person.id)) + 1

  const filteredPersons = persons.filter(person =>
    person.name && person.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }
  
  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  }
  

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notificationMessage} />
      <Filter value={searchQuery} onChange={handleSearchChange} />
      <PersonForm 
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      <h2>Numbers</h2>
      <PersonList persons={filteredPersons} setPersons={setPersons} setNotificationMessage={setNotificationMessage}/>
    </div>
  )
}

export default App