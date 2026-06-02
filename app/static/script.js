const API_BASE = '/todos';

async function fetchTodos() {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
}
async function createTodo(todo) {
    const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo)
    });
    if (!res.ok) throw new Error('Create failed');
    return res.json();
}
async function updateTodo(id, updates) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
}
async function deleteTodo(id) {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
}
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}
function renderTodoList(todos) {
    const listEl = document.getElementById('todoList');
    if (!todos.length) {
        listEl.innerHTML = '<li class="loading">No todos yet. Add one!</li>';
        return;
    }
    listEl.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.innerHTML = `
            <div class="todo-content">
                <div class="todo-title">
                    <button class="toggle-btn ${todo.completed ? 'completed' : ''}" data-id="${todo.id}" data-completed="${todo.completed}"></button>
                    <span class="${todo.completed ? 'completed' : ''}">${escapeHtml(todo.title)}</span>
                </div>
                ${todo.description ? `<div class="todo-desc">${escapeHtml(todo.description)}</div>` : ''}
            </div>
            <div class="todo-actions">
                <button class="edit-btn" data-id="${todo.id}" data-title="${escapeHtml(todo.title)}" data-desc="${escapeHtml(todo.description || '')}">✏️</button>
                <button class="delete-btn" data-id="${todo.id}">🗑️</button>
            </div>
        `;
        listEl.appendChild(li);
    });
}
async function loadAndRender() {
    try {
        const todos = await fetchTodos();
        renderTodoList(todos);
    } catch (err) {
        console.error(err);
        document.getElementById('todoList').innerHTML = '<li class="loading">Error loading todos</li>';
    }
}
document.getElementById('addBtn').addEventListener('click', async () => {
    const title = document.getElementById('titleInput').value.trim();
    if (!title) return alert('Title is required');
    const description = document.getElementById('descInput').value.trim() || null;
    await createTodo({ title, description });
    document.getElementById('titleInput').value = '';
    document.getElementById('descInput').value = '';
    await loadAndRender();
});
document.getElementById('todoList').addEventListener('click', async (e) => {
    const target = e.target;
    if (target.classList.contains('toggle-btn')) {
        const id = parseInt(target.dataset.id);
        const completed = target.dataset.completed === 'true';
        await updateTodo(id, { completed: !completed });
        await loadAndRender();
    } else if (target.classList.contains('delete-btn')) {
        const id = parseInt(target.dataset.id);
        if (confirm('Delete this todo?')) {
            await deleteTodo(id);
            await loadAndRender();
        }
    } else if (target.classList.contains('edit-btn')) {
        const id = parseInt(target.dataset.id);
        const oldTitle = target.dataset.title;
        const oldDesc = target.dataset.desc === 'null' ? '' : target.dataset.desc;
        const newTitle = prompt('Edit title', oldTitle);
        if (newTitle !== null && newTitle.trim()) {
            const newDesc = prompt('Edit description', oldDesc);
            await updateTodo(id, { title: newTitle.trim(), description: newDesc?.trim() || null });
            await loadAndRender();
        }
    }
});
loadAndRender();