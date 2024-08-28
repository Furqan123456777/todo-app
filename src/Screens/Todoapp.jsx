import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import database from '../config/firebase';
import { Paper, Grid, TextField, Button } from '@mui/material';

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);

  const todoCollectionRef = collection(database, 'todos');

  // Fetch Todos from Firestore on initial render
  useEffect(() => {
    const fetchTodos = async () => {
      const data = await getDocs(todoCollectionRef);
      setTodos(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    fetchTodos();
  }, []);

  // Add or Update a Todo
  const addTodo = async () => {
    if (input.trim() === '') return;

    if (editId) {
      // Update an existing todo
      const todoDoc = doc(database, 'todos', editId);
      await updateDoc(todoDoc, { text: input });
      setTodos(todos.map(todo => todo.id === editId ? { ...todo, text: input } : todo));
      setEditId(null);
    } else {
      // Add a new todo
      const newTodo = { id: Date.now().toString(), text: input };
      setTodos([...todos, newTodo]);

      // Save to Firestore
      const docRef = await addDoc(todoCollectionRef, { text: input });
      setTodos(todos.map(todo => todo.id === newTodo.id ? { ...todo, id: docRef.id } : todo));
    }

    // Clear the input field
    setInput('');
  };

  // Edit a Todo with a prompt
  const editTodo = (id, text) => {
    const newText = prompt("Edit your todo:", text);
    if (newText !== null && newText.trim() !== '') {
      const todoDoc = doc(database, 'todos', id);
      updateDoc(todoDoc, { text: newText });
      setTodos(todos.map(todo => todo.id === id ? { ...todo, text: newText } : todo));
    }
  };

  // Delete a Todo
  const deleteTodo = async (id) => {
    // Remove the todo from the UI immediately
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);

    // Show confirmation prompt
    const confirmation = window.confirm("Are you sure you want to delete this todo? This action cannot be undone.");

    if (confirmation) {
      try {
        const todoDoc = doc(database, 'todos', id);
        await deleteDoc(todoDoc);
        alert("Todo deleted successfully.");
      } catch (error) {
        console.error("Error deleting todo: ", error);
        // Revert UI changes if an error occurs
        setTodos(todos);
        alert("Error deleting todo. Please try again.");
      }
    } else {
      // If not confirmed, revert UI changes
      setTodos(todos);
    }
  };

  // Delete All Todos
  const deleteAllTodos = async () => {
    const confirmation = window.confirm("Are you sure you want to delete all todos? This action cannot be undone. All todos will be permanently deleted.");

    if (confirmation) {
      try {
        // Delete all todos from Firestore
        const data = await getDocs(todoCollectionRef);
        const deletePromises = data.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Clear todos from the UI
        setTodos([]);
        alert("All todos have been permanently deleted.");
      } catch (error) {
        console.error("Error deleting todos: ", error);
        alert("Error deleting todos. Please try again.");
      }
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper elevation={24} sx={{ textAlign: "center", padding: '20px' }}>
          <TextField
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new todo"
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <Button
            onClick={(e) => {
              e.preventDefault();
              addTodo();
            }}
            variant="contained"
            color="primary"
            fullWidth
          >
            {editId ? 'Update Todo' : 'Add Todo'}
          </Button>
          <Button
            onClick={deleteAllTodos}
            variant="contained"
            color="secondary"
            fullWidth
            style={{ marginTop: '10px' }}
          >
            Delete All
          </Button>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {todos.map(todo => (
              <li key={todo.id} style={{ margin: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 20 }}>
                <span style={{ flexGrow: 1, textAlign: 'left' }}>{todo.text}</span>
                <div>
                  <Button onClick={() => editTodo(todo.id, todo.text)} variant="text" color="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => deleteTodo(todo.id)} variant="text" color="error">
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TodoApp;
