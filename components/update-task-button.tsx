'use client';

import { useState, useCallback, JSX, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label as LabelComponent } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { X, PlusCircle, Loader2, Save } from 'lucide-react';
import { Task, Label, TaskPriority, TaskStatus, IconName } from '@/lib/db';
import { Icon } from './ui/icon';
import { LabelData, LabelSchema } from '@/lib/schemas/label';
import { TaskData, TaskSchema } from '@/lib/schemas/task';
import { ICON_VALUES, PREDEFINED_COLORS } from '@/lib/const';

/**
 * Props for the LabelsList component
 */
interface LabelsListProps {
  labels: LabelData[];
  onRemove: (index: number) => void;
}
/**
 * Props for the LabelDialog component
 */
interface LabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLabel: (label: LabelData) => void;
  onCancel: () => void;
}
/**
 * Props for the CreateTaskButton component
 */
interface CreateTaskButtonProps {
  task?: Task & { labels?: Label[] };
  onTaskChange?: (task: Task, isNew: boolean) => void;
}

/**
 * LabelsList Component - Displays a list of labels with remove functionality
 */
const LabelsList = ({ labels, onRemove }: LabelsListProps): JSX.Element | null => {
  if (labels.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Task labels">
      {labels.map((label, index) => (
        <div
          key={index}
          className="flex items-center rounded-md px-2 py-1 text-white"
          style={{ backgroundColor: label.color }}
          role="listitem"
        >
          <Icon iconName={label.icon} className="h-3 w-3 mr-1" />
          <span className="text-xs mr-1">{label.name}</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="ml-1 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full"
            aria-label={`Remove ${label.name} label`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
};
/**
 * LabelDialog Component - Dialog for creating and customizing labels
 */
const LabelDialog = ({
  open,
  onOpenChange,
  onAddLabel,
  onCancel,
}: LabelDialogProps): JSX.Element => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isValid },
  } = useForm<LabelData>({
    resolver: zodResolver(LabelSchema),
    defaultValues: {
      name: '',
      color: PREDEFINED_COLORS[0],
      icon: 'tag' as IconName,
    },
  });
  const currentLabel = watch();
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onCancel();
      }
      onOpenChange(open);
    },
    [onCancel, onOpenChange]
  );
  const handleAddLabel = useCallback(
    (data: LabelData) => {
      onAddLabel(data);
      reset();
    },
    [onAddLabel, reset]
  );
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Label</DialogTitle>
          <DialogDescription>Customize your label with a name, icon, and color.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleAddLabel)} className="space-y-3">
          <div>
            <LabelComponent htmlFor="labelName">Label Name</LabelComponent>
            <Input
              id="labelName"
              {...register('name')}
              placeholder="Enter label name"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'labelNameError' : undefined}
            />
            {errors.name && (
              <p id="labelNameError" className="text-red-500 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <LabelComponent htmlFor="labelIcon">Icon</LabelComponent>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={value => setValue('icon', value as IconName)}
                >
                  <SelectTrigger id="labelIcon">
                    <SelectValue placeholder="Select icon">
                      <div className="flex items-center">
                        <Icon iconName={currentLabel.icon} className="h-4 w-4 mr-2" />{' '}
                        {currentLabel.icon}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_VALUES.map(icon => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center">
                          <Icon iconName={icon} className="h-4 w-4 mr-2" /> {icon}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon.message}</p>}
          </div>
          <div>
            <LabelComponent htmlFor="LabelColor">Color</LabelComponent>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {PREDEFINED_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 rounded-md border-2 ${currentLabel.color === color ? 'border-black dark:border-white' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('color', color)}
                  aria-label={`Select color ${color}`}
                  aria-pressed={currentLabel.color === color}
                />
              ))}
            </div>
            <div className="mt-2">
              <Input
                type="color"
                {...register('color')}
                className="h-8 w-full"
                aria-label="Custom color picker"
              />
              {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>}
            </div>
          </div>
          <div className="mt-3">
            <LabelComponent htmlFor="LabelColor">Label Preview</LabelComponent>
            <div className="flex items-center mt-1 p-2 border rounded-md">
              <div
                className="flex items-center rounded-md px-2 py-1 text-white"
                style={{ backgroundColor: currentLabel.color }}
              >
                <Icon iconName={currentLabel.icon} className="h-3 w-3 mr-1" />
                <span className="text-xs">{currentLabel.name || 'Label Name'}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!isValid}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
/**
 * CreateTaskButton Component - Button and dialog for creating new tasks
 * @param props - Component props
 * @returns JSX element with the create task button and dialog
 */
export function UpdateTaskButton({ task, onTaskChange }: CreateTaskButtonProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const [labelDialogOpen, setLabelDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [existingLabels, setExistingLabels] = useState<Label[]>([]);
  const [isLoadingLabels, setIsLoadingLabels] = useState<boolean>(false);
  const { toast } = useToast();
  const isEditMode = !!task;
  /**
   * Fetch all labels when the dialog opens or component mounts in edit mode
   */
  const fetchLabels = useCallback(async () => {
    setIsLoadingLabels(true);
    try {
      const response = await fetch('/api/labels');
      if (!response.ok) {
        throw new Error('Failed to fetch labels');
      }
      const data = await response.json();
      setExistingLabels(data);
    } catch (error) {
      console.error('Error fetching labels:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch labels: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLabels(false);
    }
  }, [toast]);
  useEffect(() => {
    if (open || isEditMode) {
      fetchLabels();
    }
  }, [open, isEditMode, fetchLabels]);
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<TaskData>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || TaskPriority.MEDIUM,
      status: task?.status || TaskStatus.TODO,
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      labels: task?.labels
        ? task.labels.map((label: Label) => ({
            name: label.name,
            color: label.color,
            icon: label.icon as IconName,
          }))
        : [],
    },
  });
  const labels = watch('labels') || [];
  const addLabel = useCallback(
    (newLabel: LabelData): void => {
      const currentLabels = [...(watch('labels') || [])];
      setValue('labels', [...currentLabels, newLabel], { shouldDirty: true });
      const createNewLabel = async () => {
        try {
          const response = await fetch('/api/labels', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newLabel),
          });
          if (!response.ok) {
            throw new Error('Failed to create label in database');
          }
          const createdLabel = await response.json();
          setExistingLabels(prevLabels => [...prevLabels, createdLabel]);
        } catch (error) {
          console.error('Error creating label in database:', error);
          toast({
            title: 'Error',
            description: `Failed to save label to database: ${(error as Error).message}`,
            variant: 'destructive',
          });
        }
      };
      if (labelDialogOpen) {
        createNewLabel();
      }
      setLabelDialogOpen(false);
    },
    [setValue, watch, labelDialogOpen, toast]
  );
  /**
   * Remove a label from the list
   * @param index - Index of the label to remove
   */
  const removeLabel = useCallback(
    (index: number): void => {
      const currentLabels = [...(watch('labels') || [])];
      currentLabels.splice(index, 1);
      setValue('labels', currentLabels, { shouldDirty: true });
    },
    [setValue, watch]
  );
  /**
   * Handle dialog close with confirmation if form is dirty
   */
  const handleDialogClose = useCallback(
    (open: boolean) => {
      if (open) {
        // Labels are now fetched in useEffect
      } else if (isDirty) {
        // In a real app, you might want to show a confirmation dialog here
        if (confirm('You have unsaved changes. Are you sure you want to close?')) {
          reset();
          setOpen(false);
        } else {
          return;
        }
      }
      setOpen(open);
    },
    [isDirty, reset]
  );
  /**
   * Submit handler for the form
   * @param data - Form data
   */
  const onSubmit = async (data: TaskData): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Ensure dueDate is properly formatted as an ISO string if it exists
      const formattedData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        labels: data.labels || [],
      };
      if (isEditMode && task) {
        // Update existing task
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update task');
        }
        const updatedTask = await response.json();
        if (onTaskChange) {
          onTaskChange(updatedTask, false);
        }
        toast({
          title: 'Task updated',
          description: 'Your task has been successfully updated.',
          variant: 'default',
        });
      } else {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create task');
        }
        const createdTask = await response.json();
        if (onTaskChange) {
          onTaskChange(createdTask, true);
        }
        toast({
          title: 'Task created',
          description: 'Your task has been successfully created.',
          variant: 'default',
        });
      }
      reset();
      setOpen(false);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} task:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} task: ${(error as Error).message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  /**
   * Handle cancel for label dialog
   */
  const handleLabelCancel = useCallback(() => {
    setLabelDialogOpen(false);
  }, []);
  return (
    <>
      {!isEditMode ? (
        <Dialog open={open} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button aria-label="Create Task">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white dark:bg-black">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>Enter the details for your new task below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <LabelComponent htmlFor="title">Title</LabelComponent>
                <Input
                  id="title"
                  {...register('title')}
                  aria-required="true"
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? 'titleError' : undefined}
                />
                {errors.title && (
                  <p id="titleError" className="text-red-500 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <LabelComponent htmlFor="description">Description</LabelComponent>
                <Textarea
                  id="description"
                  {...register('description')}
                  className="min-h-[80px] resize-y"
                  placeholder="Add details about this task..."
                />
              </div>
              <div>
                <LabelComponent htmlFor="priority">Priority</LabelComponent>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskPriority).map(priority => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.priority && (
                  <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
                )}
              </div>
              <div>
                <LabelComponent htmlFor="status">Status</LabelComponent>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskStatus).map(status => (
                          <SelectItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>
              <div>
                <LabelComponent htmlFor="dueDate">Due Date</LabelComponent>
                <Input
                  type="date"
                  id="dueDate"
                  {...register('dueDate')}
                  aria-invalid={!!errors.dueDate}
                  aria-describedby={errors.dueDate ? 'dueDateError' : undefined}
                />
                {errors.dueDate && (
                  <p id="dueDateError" className="text-red-500 text-sm mt-1">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <LabelComponent htmlFor="labels">Labels</LabelComponent>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLabelDialogOpen(true)}
                      className="h-8"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Label
                    </Button>
                  </div>
                </div>
                <div className="mb-2">
                  <Select
                    onValueChange={value => {
                      const selectedLabel = existingLabels.find(label => label.id === value);
                      if (selectedLabel) {
                        const isLabelAlreadyAdded = labels.some(
                          label => label.name === selectedLabel.name
                        );
                        if (!isLabelAlreadyAdded) {
                          addLabel({
                            name: selectedLabel.name,
                            color: selectedLabel.color,
                            icon: selectedLabel.icon as IconName,
                          });
                        } else {
                          toast({
                            title: 'Label already added',
                            description: `The label "${selectedLabel.name}" is already added to this task.`,
                            variant: 'default',
                          });
                        }
                      }
                    }}
                    disabled={isLoadingLabels || existingLabels.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select label(s)" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLabels ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading labels...
                        </div>
                      ) : existingLabels.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No labels found
                        </div>
                      ) : (
                        existingLabels.map(label => (
                          <SelectItem key={label.id} value={label.id}>
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: label.color }}
                              ></div>
                              <span className="mr-1">{label.name}</span>
                              <Icon iconName={label.icon} className="h-3 w-3 ml-1" />
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <LabelsList labels={labels} onRemove={removeLabel} />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {!isSubmitting &&
                  (isEditMode ? (
                    <Save className="mr-2 h-4 w-4" />
                  ) : (
                    <PlusCircle className="mr-2 h-4 w-4" />
                  ))}
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditMode ? (
                  'Update Task'
                ) : (
                  'Create Task'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <LabelComponent htmlFor="title">Title</LabelComponent>
            <Input
              id="title"
              {...register('title')}
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'titleError' : undefined}
            />
            {errors.title && (
              <p id="titleError" className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <LabelComponent htmlFor="description">Description</LabelComponent>
            <Textarea
              id="description"
              {...register('description')}
              className="min-h-[80px] resize-y"
              placeholder="Add details about this task..."
            />
          </div>
          <div>
            <LabelComponent htmlFor="priority">Priority</LabelComponent>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskPriority).map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.priority && (
              <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>
            )}
          </div>
          <div>
            <LabelComponent htmlFor="status">Status</LabelComponent>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
          </div>
          <div>
            <LabelComponent htmlFor="dueDate">Due Date</LabelComponent>
            <Input
              type="date"
              id="dueDate"
              {...register('dueDate')}
              aria-invalid={!!errors.dueDate}
              aria-describedby={errors.dueDate ? 'dueDateError' : undefined}
            />
            {errors.dueDate && (
              <p id="dueDateError" className="text-red-500 text-sm mt-1">
                {errors.dueDate.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <LabelComponent htmlFor="labels">Labels</LabelComponent>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLabelDialogOpen(true)}
                  className="h-8"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Label
                </Button>
              </div>
            </div>
            <div className="mb-2">
              <Select
                onValueChange={value => {
                  const selectedLabel = existingLabels.find(label => label.id === value);
                  if (selectedLabel) {
                    const isLabelAlreadyAdded = labels.some(
                      label => label.name === selectedLabel.name
                    );
                    if (!isLabelAlreadyAdded) {
                      addLabel({
                        name: selectedLabel.name,
                        color: selectedLabel.color,
                        icon: selectedLabel.icon as IconName,
                      });
                    } else {
                      toast({
                        title: 'Label already added',
                        description: `The label "${selectedLabel.name}" is already added to this task.`,
                        variant: 'default',
                      });
                    }
                  }
                }}
                disabled={isLoadingLabels || existingLabels.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select label(s)" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingLabels ? (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading labels...
                    </div>
                  ) : existingLabels.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No labels found
                    </div>
                  ) : (
                    existingLabels.map(label => (
                      <SelectItem key={label.id} value={label.id}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: label.color }}
                          ></div>
                          <span className="mr-1">{label.name}</span>
                          <Icon iconName={label.icon} className="h-3 w-3 ml-1" />
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <LabelsList labels={labels} onRemove={removeLabel} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {!isSubmitting &&
              (isEditMode ? (
                <Save className="mr-2 h-4 w-4" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              ))}
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Task'
            )}
          </Button>
        </form>
      )}
      <LabelDialog
        open={labelDialogOpen}
        onOpenChange={setLabelDialogOpen}
        onAddLabel={addLabel}
        onCancel={handleLabelCancel}
      />
    </>
  );
}
