import { useState, useEffect } from 'react'

const Button = ({ handleClick, text }) => (
  <button onClick={handleClick}>
    {text}
  </button>
)

const StatisticLine = ({text, value}) => {
  return (
    <tr>
      <td>{text}</td>
      <td>{text === 'positive' ? `${value}%` : value}</td>
    </tr>
  )
}

const Statistics = ({ good, neutral, bad, total }) => {
  return (
    <table>
      <tbody>
        <StatisticLine text="Good" value={good} />
        <StatisticLine text="Neutral" value={neutral} />
        <StatisticLine text="Bad" value={bad} />
        <StatisticLine text="All" value={total} />
        <StatisticLine
          text="Average"
          value={total === 0 ? 0 : (good - bad) / total}
        />
        <StatisticLine
          text="Positive"
          value={good === 0 ? 0 : (good / total) * 100}
          percent={true}
        />
      </tbody>
    </table>
  );
};



const App = () => {
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(0)
  const [points, setPoints] = useState(Array.from({ length: 8 }, () => 0));
  const [popular, setPopular] = useState(0);
  console.log(points) 

  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.',
    'The only way to go fast, is to go well.'
  ]

  useEffect(() => {
    handlePopular();
  }, [points]); // run handlePopular whenever points change
  
  const handleGoodClick = () => {
    const updatedGood = good + 1
    setGood(updatedGood)
    setTotal(updatedGood + bad + neutral)
  }

  const handleBadClick = () => {
    const updatedBad = bad + 1
    setBad(updatedBad)
    setTotal(good + updatedBad + neutral)
  }

  const handleNeutralClick = () => {
    const updatedNeutral = neutral + 1
    setNeutral(updatedNeutral)
    setTotal(good + bad + updatedNeutral)
  }

  const handleAnecdoteClick = () => {
    const randomNumber = Math.floor(Math.random() * 8)
    setSelected(randomNumber)
  }

  const handleVoteClick = () => {
    const copy = { ...points}
    copy[selected] +=1
    setPoints(copy)
  }

  const handlePopular = () => {
    let biggest = 0
    for (let i = 0; i<8;i++){
      if (points[i]>points[biggest]){
        biggest = i
      }
    }
    setPopular(biggest)
  }

  return (
    <div>
      <div>
        <h1>Anecdote of the day</h1>
        <p>{anecdotes[selected]}</p>
        <p>this anecdote has {points[selected]} votes</p>
        <Button handleClick={handleVoteClick} text='vote'/>
        <Button handleClick={handleAnecdoteClick} text='next anectode'/>
      </div>
      <div>
        <h1>Anecdote with the most votes</h1>
          <p>{anecdotes[popular]}</p>
          <p>this anecdote has {points[popular]} votes</p>
      </div>
      <header><h1>give feedback</h1></header>
      <Button handleClick={handleGoodClick} text='Good' />
      <Button handleClick={handleNeutralClick} text='Neutral' />
      <Button handleClick={handleBadClick} text='Bad' />
      <h1>statistics</h1>
      {total === 0 ? (
        <p>No feedback given</p>
      ) : (
        <div>
          <Statistics good={good} bad={bad} neutral={neutral} total={total} />
        </div>
      )}
    </div>
  )
}

export default App

