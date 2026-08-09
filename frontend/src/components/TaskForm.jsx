import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Bookmark } from 'lucide-react';

export default function TaskForm({ task, onSave, onClose, showToast }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'pending');
      setPriority(task.priority || 'medium');
      // Format date for <input type="date">
      if (task.due_date) {
        // Date is usually returned as YYYY-MM-DDT00:00:00.000Z or YYYY-MM-DD
        const formattedDate = task.due_date.split('T')[0];
        setDueDate(formattedDate);
      } else {
        setDueDate('');
      }
    } else {
      // Defaults for new task
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
      setDueDate('');
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('O título da tarefa é obrigatório.', 'warning');
      return;
    }

    setSaving(true);
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      due_date: dueDate || null
    };

    try {
      await onSave(taskData);
      onClose();
    } catch (err) {
      showToast(err.message || 'Erro ao salvar a tarefa.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="close-modal-btn" aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="task-title">Título *</label>
            <input
              type="text"
              id="task-title"
              placeholder="Ex: Estudar React Router"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Descrição</label>
            <textarea
              id="task-desc"
              placeholder="Detalhes adicionais sobre a tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-status">Status</label>
              <div className="select-wrapper">
                <Bookmark className="select-icon" size={16} />
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pendente</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority">Prioridade</label>
              <div className="select-wrapper">
                <AlertCircle className="select-icon" size={16} />
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="task-due">Data de Vencimento</label>
            <div className="input-icon-wrapper">
              <Calendar className="input-icon" size={16} />
              <input
                type="date"
                id="task-due"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn" disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
