import React from 'react';
import { Calendar, Trash2, Edit2, CheckCircle, Circle, AlertCircle, PlayCircle } from 'lucide-react';

export default function TaskCard({ task, onUpdateStatus, onEdit, onDelete }) {
  // Format due date to Portuguese layout
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    // Ignore timezone shift by using UTC values or adjusting
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  // Check if a task is overdue
  const isOverdue = () => {
    if (!task.due_date || task.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Toggle status cycling: pending -> in_progress -> completed -> pending
  const handleToggleStatus = (e) => {
    e.stopPropagation();
    let nextStatus;
    if (task.status === 'pending') {
      nextStatus = 'in_progress';
    } else if (task.status === 'in_progress') {
      nextStatus = 'completed';
    } else {
      nextStatus = 'pending';
    }
    onUpdateStatus(task.id, nextStatus);
  };

  const getStatusIcon = () => {
    if (task.status === 'completed') {
      return <CheckCircle className="status-icon completed-icon" size={22} />;
    } else if (task.status === 'in_progress') {
      return <PlayCircle className="status-icon progress-icon" size={22} />;
    } else {
      return <Circle className="status-icon pending-icon" size={22} />;
    }
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta'
    };
    return labels[priority] || priority;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      completed: 'Concluída'
    };
    return labels[status] || status;
  };

  return (
    <div className={`task-card-item priority-${task.priority} ${task.status === 'completed' ? 'is-completed' : ''}`}>
      <div className="task-card-header">
        <button 
          onClick={handleToggleStatus} 
          className="status-toggle-btn"
          title={`Alterar status (Atual: ${getStatusLabel(task.status)})`}
        >
          {getStatusIcon()}
        </button>
        <span className={`status-badge ${task.status}`}>
          {getStatusLabel(task.status)}
        </span>
      </div>

      <div className="task-card-body">
        <h3 className="task-card-title">{task.title}</h3>
        {task.description && <p className="task-card-description">{task.description}</p>}
      </div>

      <div className="task-card-footer">
        <div className="task-meta">
          <span className={`priority-badge ${task.priority}`}>
            {getPriorityLabel(task.priority)}
          </span>

          {task.due_date && (
            <span className={`due-date-badge ${isOverdue() ? 'overdue' : ''}`}>
              <Calendar size={12} />
              <span>{formatDate(task.due_date)}</span>
              {isOverdue() && <AlertCircle size={12} className="overdue-alert-icon" />}
            </span>
          )}
        </div>

        <div className="task-actions">
          <button 
            onClick={() => onEdit(task)} 
            className="action-btn edit-btn" 
            title="Editar tarefa"
            aria-label="Editar tarefa"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(task.id)} 
            className="action-btn delete-btn" 
            title="Excluir tarefa"
            aria-label="Excluir tarefa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
