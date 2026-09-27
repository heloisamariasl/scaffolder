import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Plus, Tag, Trash2, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ActionFeedback, EmptyState, ErrorState, LoadingState } from '../components/ui/state-feedback';
import {
  categoriesControllerCreate,
  categoriesControllerFindAll,
  categoriesControllerRemove,
  categoriesControllerUpdate,
} from '../lib/api-client';
import type { CategoryDto } from '../lib/api-client/models';

const categoryFormSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres.').max(50, 'Máximo 50 caracteres.'),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Cor inválida, ex: #3B82F6').optional(),
});
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: categories, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoriesControllerFindAll();
      return res.data as CategoryDto[];
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', color: '#3B82F6' },
  });

  const openCreate = () => {
    setEditingCategory(null);
    reset({ name: '', color: '#3B82F6' });
    setIsFormOpen(true);
  };

  const openEdit = (category: CategoryDto) => {
    setEditingCategory(category);
    reset({ name: category.name, color: category.color });
    setIsFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      if (editingCategory) {
        return categoriesControllerUpdate(editingCategory.id, values);
      }
      return categoriesControllerCreate(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsFormOpen(false);
      setFeedback({ type: 'success', message: editingCategory ? 'Categoria atualizada!' : 'Categoria criada!' });
    },
    onError: (error: any) => {
      setFeedback({ type: 'error', message: error?.response?.data?.detail || 'Erro ao salvar categoria.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesControllerRemove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setFeedback({ type: 'success', message: 'Categoria excluída!' });
    },
    onError: () => {
      setFeedback({ type: 'error', message: 'Erro ao excluir categoria.' });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Categorias</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Organize suas tarefas por categoria.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nova categoria
        </Button>
      </div>

      {feedback && (
        <ActionFeedback type={feedback.type} message={feedback.message} onDismiss={() => setFeedback(null)} />
      )}

      {isFormOpen && (
        <Card>
          <CardContent className="p-4">
            <form
              onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label className="text-sm font-medium">Nome</label>
                <Input {...register('name')} placeholder="Ex: Trabalho" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Cor</label>
                <input type="color" {...register('color')} className="h-10 w-16 rounded border" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {editingCategory ? 'Salvar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading && <LoadingState message="Carregando categorias..." />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && (!categories || categories.length === 0) && (
        <EmptyState
          icon={<Tag className="h-6 w-6" />}
          title="Nenhuma categoria cadastrada"
          description="Crie sua primeira categoria para organizar as tarefas."
          action={<Button onClick={openCreate}>Criar categoria</Button>}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <Card key={category.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium text-slate-900 dark:text-slate-100">{category.name}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => openEdit(category)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Excluir a categoria "${category.name}"?`)) {
                      deleteMutation.mutate(category.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}