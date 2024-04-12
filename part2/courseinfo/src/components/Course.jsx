const Course = ({ course }) => {
    const Header = ({ course }) => <h1>{course}</h1>

    const Total = ({ parts }) => {
        const sum = parts.reduce((total, part) => total + part.exercises, 0)
        return <p><b>total of {sum} exercises</b></p>
    };

    const Part = ({ part }) => 
    <p>
        {part.name} {part.exercises}
    </p>

    const Content = ({ parts }) => (
        <>
            {parts.map((part, index) => (
                <Part key={index} part={part} />
            ))}
        </>
    )


    return (
        <div>
            <Header course={course.name} />
            <Content parts={course.parts} />
            <Total parts={course.parts} />
        </div>
    )
}

export default Course