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
  const [notificationType, setNotificationType] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const validatePhoneNumber = (number) => {
    const regex = /^\d{2}-\d{6,}$|^\d{3}-\d{5,}$/
    return regex.test(number)
  }

  const addPerson = (event) =>{
    event.preventDefault()
    //validating name length
    if (newName.length < 3) {
      setNotificationMessage("Name must be at least 3 characters long")
      setNotificationType("error")
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
      return 
    }
    if (!validatePhoneNumber(newNumber)) {
      setNotificationMessage("Invalid phone number format (must have length of 8 or more and be formed of two parts that are separated by - where the first is 2-3 digits")
      setNotificationType("error")
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
      return
    }
    const existingPerson = persons.find(person =>person.name === newName)
    if(existingPerson){
      if(window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        console.log(existingPerson.id)
        const updatedPerson = { ...existingPerson, number: newNumber }
        personService
          .update(String(existingPerson.id), updatedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== existingPerson.id ? person : returnedPerson))
            setNotificationMessage(`Altered ${updatedPerson.name}'s number`)
            setNotificationType('success')
            setTimeout(() => {
              setNotificationMessage(null)
            }, 5000)
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            setNotificationMessage(`Information of ${updatedPerson.name} has already been removed from server`)
            setNotificationType('error')
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
          setNotificationMessage(`Added ${personObject.name}`)
          setNotificationType('success')
          setTimeout(() => {
            setNotificationMessage(null)
          }, 5000)
          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          console.log(error.response.data.error)
          setNotificationMessage(`${error.response.data.error}`)
          setNotificationType(`error`)
        })  
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
      <Notification message={notificationMessage} type={notificationType} />
      <Filter value={searchQuery} onChange={handleSearchChange} />
      <PersonForm 
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      <h2>Numbers</h2>
      <PersonList persons={filteredPersons} setPersons={setPersons} setNotificationMessage={setNotificationMessage} setNotificationType={setNotificationType}/>
    </div>
  )
}

export default App