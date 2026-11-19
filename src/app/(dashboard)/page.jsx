'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar as CalendarIcon,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
  MONTHS_PT,
  WEEKDAYS_PT,
  ACTIVITY_TYPES,
  getCalendarDays,
  extractUTCDateParts,
} from '@/lib/dateUtils';
import ActivityModal from '@/components/modals/ActivityModal';

export default function CalendarDashboardPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const loadSubjects = useCallback(async () => {
    try {
      const data = await apiFetch('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        month: String(currentMonth),
        year: String(currentYear),
        ...(selectedSubjectId ? { subjectId: selectedSubjectId } : {}),
      });
      const data = await apiFetch(`/activities/calendar?${query.toString()}`);
      setActivities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentYear, selectedSubjectId]);

  useEffect(() => {
    loadSubjects();
    const handleSubjectsUpdated = () => loadSubjects();
    window.addEventListener('subjects-updated', handleSubjectsUpdated);
    return () => window.removeEventListener('subjects-updated', handleSubjectsUpdated);
  }, [loadSubjects]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  function handlePrevMonth() {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(1);
  }

  function handleNextMonth() {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(1);
  }

  function handleGoToday() {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDay(now.getDate());
  }

  async function handleToggleComplete(activity) {
    // Atualização otimista
    setActivities((prev) =>
      prev.map((item) =>
        item.id === activity.id ? { ...item, concluida: !item.concluida } : item
      )
    );
    try {
      await apiFetch(`/activities/${activity.id}/complete`, { method: 'PATCH' });
    } catch (err) {
      loadActivities();
    }
  }

  async function handleDeleteActivity(activity) {
    if (!window.confirm(`Deseja realmente apagar "${activity.titulo}" para toda a turma?`)) {
      return;
    }
    try {
      await apiFetch(`/activities/${activity.id}`, { method: 'DELETE' });
      loadActivities();
    } catch (err) {
      alert(err.message);
    }
  }

  const calendarCells = getCalendarDays(currentYear, currentMonth);

  // Agrupa atividades por dia do mês
  const activitiesByDay = {};
  for (const act of activities) {
    const { day } = extractUTCDateParts(act.dataEntrega);
    if (!activitiesByDay[day]) activitiesByDay[day] = [];
    activitiesByDay[day].push(act);
  }

  const selectedDayActivities = activitiesByDay[selectedDay] || [];
  const formattedSelectedDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(
    selectedDay
  ).padStart(2, '0')}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho e Filtros por Matéria */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendário de Atividades</h1>
          <p className="text-sm text-slate-500">
            Todos os alunos da matéria podem adicionar, editar ou atualizar entregas.
          </p>
        </div>

        <button
          disabled={subjects.length === 0}
          onClick={() => {
            setEditingActivity(null);
            setActivityModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Nova Atividade
        </button>
      </div>

      {/* Chips de Filtro de Matérias */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSubjectId('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition ${
            selectedSubjectId === ''
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          Todas as matérias
        </button>

        {subjects.map((sub) => {
          const isSelected = selectedSubjectId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(isSelected ? '' : sub.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border flex items-center gap-2 transition ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: sub.corHex }}
              />
              {sub.nome}
            </button>
          );
        })}
      </div>

      {/* Grid Principal: Calendário + Painel do Dia */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Grade Mensal */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Controles do Mês */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                {MONTHS_PT[currentMonth - 1]} {currentYear}
              </h2>
              {loading && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleGoToday}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Hoje
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
            {WEEKDAYS_PT.map((dayName) => (
              <div
                key={dayName}
                className="py-2.5 text-center text-xs font-semibold text-slate-500 uppercase"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Células dos Dias */}
          <div className="grid grid-cols-7">
            {calendarCells.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[84px] sm:min-h-[104px] bg-slate-50/50 border-b border-r border-slate-100"
                  />
                );
              }

              const dayActs = activitiesByDay[day] || [];
              const isToday =
                day === today.getDate() &&
                currentMonth === today.getMonth() + 1 &&
                currentYear === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[84px] sm:min-h-[104px] p-1.5 sm:p-2 border-b border-r border-slate-100 text-left flex flex-col transition focus:outline-none ${
                    isSelected ? 'bg-blue-50/70 ring-2 ring-inset ring-blue-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center mb-1 ${
                      isToday
                        ? 'bg-blue-600 text-white'
                        : isSelected
                        ? 'text-blue-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>

                  <div className="w-full space-y-1 overflow-hidden">
                    {dayActs.slice(0, 3).map((act) => (
                      <div
                        key={act.id}
                        style={{
                          backgroundColor: `${act.subject.corHex}18`,
                          borderLeftColor: act.subject.corHex,
                        }}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-medium border-l-2 truncate ${
                          act.concluida ? 'line-through opacity-55' : 'text-slate-800'
                        }`}
                      >
                        {act.titulo}
                      </div>
                    ))}
                    {dayActs.length > 3 && (
                      <span className="block text-[10px] font-semibold text-slate-500 pl-1">
                        +{dayActs.length - 3} mais
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Painel Lateral: Atividades do Dia Selecionado */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Entregas do dia
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {String(selectedDay).padStart(2, '0')} de {MONTHS_PT[currentMonth - 1]}
              </h3>
            </div>

            {subjects.length > 0 && (
              <button
                onClick={() => {
                  setEditingActivity(null);
                  setActivityModalOpen(true);
                }}
                className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                title="Adicionar tarefa neste dia"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 py-4 space-y-3 overflow-y-auto">
            {subjects.length === 0 ? (
              <div className="text-center py-10 px-4">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">
                  Você ainda não participa de nenhuma matéria
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Clique em &quot;Entrar com Código&quot; no menu lateral para acessar sua turma.
                </p>
              </div>
            ) : selectedDayActivities.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-sm text-slate-500">Nenhuma atividade cadastrada para este dia.</p>
                <button
                  onClick={() => {
                    setEditingActivity(null);
                    setActivityModalOpen(true);
                  }}
                  className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  + Adicionar tarefa neste dia
                </button>
              </div>
            ) : (
              selectedDayActivities.map((act) => {
                const typeStyle = ACTIVITY_TYPES[act.tipo] || ACTIVITY_TYPES.OUTRO;
                return (
                  <div
                    key={act.id}
                    className={`p-4 rounded-xl border transition ${
                      act.concluida
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold text-white"
                          style={{ backgroundColor: act.subject.corHex }}
                        >
                          {act.subject.nome}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${typeStyle.badge}`}
                        >
                          {typeStyle.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setEditingActivity(act);
                            setActivityModalOpen(true);
                          }}
                          title="Editar tarefa"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act)}
                          title="Excluir tarefa"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-start gap-2.5">
                      <button
                        onClick={() => handleToggleComplete(act)}
                        className="mt-0.5 text-blue-600 hover:scale-110 transition shrink-0"
                        title={
                          act.concluida ? 'Desmarcar conclusão' : 'Marcar como concluída por mim'
                        }
                      >
                        {act.concluida ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h4
                          className={`font-semibold text-sm text-slate-900 ${
                            act.concluida ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {act.titulo}
                        </h4>

                        {act.descricao && (
                          <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
                            {act.descricao}
                          </p>
                        )}

                        {act.linkApoio && (
                          <a
                            href={act.linkApoio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline mt-2"
                          >
                            Acessar material / link
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <p className="text-[11px] text-slate-400 mt-2.5">
                          Criado por {act.criadoPor?.nome}
                          {act.atualizadoPor ? ` • Editado por ${act.atualizadoPor.nome}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal de Criar / Editar Atividade */}
      <ActivityModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        subjects={subjects}
        defaultDate={formattedSelectedDate}
        defaultSubjectId={selectedSubjectId}
        editingActivity={editingActivity}
        onSaved={loadActivities}
      />
    </div>
  );
}
