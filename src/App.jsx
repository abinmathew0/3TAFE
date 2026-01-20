import { useState, useEffect } from 'react'
import './App.css'

// API Helper
const API_URL = import.meta.env.VITE_API_URL;

function App() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [dbStatus, setDbStatus] = useState('Checking...')
    const [newTask, setNewTask] = useState('')

    // Fetch Todos
    const fetchTodos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/todos`);
            if (!response.ok) throw new Error('Failed to fetch todos');
            const data = await response.json();
            setTasks(data);
            setDbStatus('Connected');
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setDbStatus('Error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    // Add Todo
    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const response = await fetch(`${API_URL}/todos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTask })
            });
            if (!response.ok) throw new Error('Failed to add task');
            const savedTask = await response.json();
            setTasks([savedTask, ...tasks]);
            setNewTask('');
        } catch (err) {
            alert(err.message);
        }
    };

    // Toggle Complete
    const handleToggle = async (id, currentStatus) => {
        try {
            // Optimistic update
            const updatedTasks = tasks.map(t =>
                t.id === id ? { ...t, completed: !currentStatus } : t
            );
            setTasks(updatedTasks);

            const response = await fetch(`${API_URL}/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !currentStatus })
            });
            if (!response.ok) throw new Error('Failed to update task');
        } catch (err) {
            console.error(err);
            fetchTodos(); // Revert on error
        }
    };

    // Delete Todo
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            const response = await fetch(`${API_URL}/todos/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete task');
            setTasks(tasks.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div className="container">
            <header>
                <h1>My 3-Tier App</h1>
                <p>Built with React, Node.js, and Azure SQL</p>
            </header>

            <main>
                <div className="card-grid">
                    {/* Status Card */}
                    <div className="card status-card">
                        <h2>System Health</h2>
                        <div className="status-item">
                            <span className="label">Frontend</span>
                            <span className="status ok">Online</span>
                        </div>
                        <div className="status-item">
                            <span className="label">Backend</span>
                            <span className={`status ${error ? 'error' : 'ok'}`}>
                                {error ? 'Unreachable' : 'Connected'}
                            </span>
                        </div>
                        <div className="status-item">
                            <span className="label">Database</span>
                            <span className={`status ${dbStatus === 'Connected' ? 'ok' : 'error'}`}>
                                {dbStatus}
                            </span>
                        </div>
                    </div>

                    {/* Todo App Card */}
                    <div className="card data-card">
                        <h2>Your Tasks</h2>

                        <form className="todo-input-group" onSubmit={handleAddTodo}>
                            <input
                                type="text"
                                placeholder="What needs to be done?"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                disabled={!!error}
                            />
                            <button type="submit" className="add-btn" disabled={!newTask.trim() || !!error}>
                                Add
                            </button>
                        </form>

                        {loading && <p>Loading tasks...</p>}

                        {!loading && !error && (
                            <ul className="todo-list">
                                {tasks.map((task) => (
                                    <li key={task.id} className={`todo-item ${task.completed ? 'completed' : ''}`}>
                                        <div className="todo-content" onClick={() => handleToggle(task.id, task.completed)}>
                                            <div className="checkbox">
                                                {task.completed && '✓'}
                                            </div>
                                            <span>{task.title}</span>
                                        </div>
                                        <button className="delete-btn" onClick={() => handleDelete(task.id)}>
                                            ✕
                                        </button>
                                    </li>
                                ))}
                                {tasks.length === 0 && <p style={{ textAlign: 'center', marginTop: '2rem' }}>No tasks yet. Add one above!</p>}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App
