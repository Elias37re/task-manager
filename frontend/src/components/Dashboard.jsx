import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, LogOut, CheckSquare, Clock, AlertTriangle, Layers, ArrowUpDown } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';

export default function Dashboard({ user, onLogout, showToast }) {
  const [tasks, setTasks] = useState([]);
  const [unfilteredTasks, setUnfilteredTasks] = useState([]); // for calculating global stats
  const [loading, setLoading] = useState(true);
  
  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch Tasks with filters
  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        search,
        status: statusFilter,
        priority: priorityFilter,
        sortBy,
        order: sortOrder
      });

      const response = await fetch(`/api/tasks?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          onLogout();
          return;
        }
        throw new Error('Erro ao buscar tarefas');
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [search, statusFilter, priorityFilter, sortBy, sortOrder, onLogout, showToast]);

  // Fetch all tasks unfiltered for stats calculations
  const fetchUnfilteredTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnfilteredTasks(data);
      }
    } catch (err) {
      console.error('Error fetching unfiltered tasks:', err.message);
    }
  }, []);

  // Refresh lists helper
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchTasks(), fetchUnfilteredTasks()]);
    setLoading(false);
  }, [fetchTasks, fetchUnfilteredTasks]);

  // Trigger fetch when parameters change
  useEffect(() => {
    refreshAllData();
  }, [search, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Handle task save (Create or Edit)
  const handleSaveTask = async (taskData) => {
    const token = localStorage.getItem('token');
    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
    const method = editingTask ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao salvar a tarefa');
    }

    showToast(
      editingTask ? 'Tarefa atualizada!' : 'Tarefa criada com sucesso!',
      'success'
    );
    
    refreshAllData();
  };

  // Toggle status cycling
  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o status');
      }

      showToast('Status atualizado!', 'success');
      refreshAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir a tarefa');
      }

      showToast('Tarefa excluída!', 'success');
      refreshAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Calculate Metrics from unfiltered list
  const totalCount = unfilteredTasks.length;
  const pendingCount = unfilteredTasks.filter(t => t.status === 'pending').length;
  const inProgressCount = unfilteredTasks.filter(t => t.status === 'in_progress').length;
  const completedCount = unfilteredTasks.filter(t => t.status === 'completed').length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-logo">
          <div className="logo-badge small">
            <span>✓</span>
          </div>
          <h2>TaskSpace</h2>
        </div>
        <div className="user-profile">
          <div className="user-info">
            <span className="welcome-text">Olá,</span>
            <span className="username-text">{user.username}</span>
          </div>
          <button onClick={onLogout} className="logout-btn" title="Sair da conta">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Metrics Section */}
      <section className="metrics-section">
        <div className="metric-card progress-overview">
          <div className="metric-card-header">
            <h3>Progresso Geral</h3>
            <span className="progress-percent">{completionPercentage}%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
          </div>
          <p className="progress-text">{completedCount} de {totalCount} tarefas concluídas</p>
        </div>

        <div className="metrics-grid">
          <div className="metric-card total">
            <div className="metric-icon-wrapper">
              <Layers size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-value">{totalCount}</span>
              <span className="metric-label">Total</span>
            </div>
          </div>

          <div className="metric-card pending">
            <div className="metric-icon-wrapper">
              <Clock size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-value">{pendingCount}</span>
              <span className="metric-label">Pendentes</span>
            </div>
          </div>

          <div className="metric-card progress">
            <div className="metric-icon-wrapper">
              <ArrowUpDown size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-value">{inProgressCount}</span>
              <span className="metric-label">Em Andamento</span>
            </div>
          </div>

          <div className="metric-card completed">
            <div className="metric-icon-wrapper">
              <CheckSquare size={20} />
            </div>
            <div className="metric-details">
              <span className="metric-value">{completedCount}</span>
              <span className="metric-label">Concluídas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Control Panel (Search, Filters, Sorting) */}
      <section className="control-panel">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Pesquisar tarefas por título ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-wrapper">
          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">Prioridade</label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">Todas</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Ordenar por</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_at">Data de Criação</option>
              <option value="title">Título</option>
              <option value="due_date">Data de Vencimento</option>
              <option value="priority">Prioridade</option>
            </select>
          </div>

          <button 
            className="sort-direction-btn" 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            title={`Ordem: ${sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}`}
            aria-label="Inverter ordem"
          >
            <ArrowUpDown size={18} />
            <span className="sort-order-text">{sortOrder === 'asc' ? 'ASC' : 'DESC'}</span>
          </button>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="tasks-main-content">
        <div className="section-title-row">
          <h2>Suas Tarefas ({tasks.length})</h2>
          <button onClick={handleCreateClick} className="create-task-btn">
            <Plus size={18} />
            <span>Nova Tarefa</span>
          </button>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner large"></div>
            <p>Carregando tarefas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-tasks-container">
            <div className="empty-tasks-icon">📭</div>
            <h3>Nenhuma tarefa encontrada</h3>
            <p>Tente ajustar os filtros de pesquisa ou crie uma nova tarefa para começar!</p>
            <button onClick={handleCreateClick} className="create-task-btn outline">
              Criar minha primeira tarefa
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdateStatus={handleUpdateStatus}
                onEdit={handleEditClick}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Modal for Create / Edit */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => setIsFormOpen(false)}
          showToast={showToast}
        />
      )}
    </div>
  );
}
