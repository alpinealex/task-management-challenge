import { NextResponse } from 'next/server';
import { prisma, TaskPriority, TaskStatus } from '@/lib/db';
import { z } from 'zod';

/**
 * Type for label data matching the Prisma schema
 */
type LabelData = {
  name: string;
  color: string;
  icon: string;
};

/**
 * Zod schema for label validation
 */
const LabelSchema = z.object({
  name: z.string().min(1, 'Label name is required'),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Color must be a valid hex code'),
  icon: z.string().min(1, 'Icon is required'),
});

/**
 * Zod schema for task creation validation
 */
const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  dueDate: z.string().optional().refine(
    (val) => !val || !isNaN(new Date(val).getTime()),
    { message: 'Invalid date format' }
  ),
  labels: z.array(LabelSchema).optional(),
});

/**
 * Creates a new task
 * @param request The incoming request object
 * @returns The created task or error response
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const data = await request.json();
    
    // Validate input data
    const validationResult = CreateTaskSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }
    
    const validData = validationResult.data;

    // Parse the dueDate string to a proper Date object if it exists
    const dueDate = validData.dueDate ? new Date(validData.dueDate) : null;

    // Create the task first (without labels)
    const task = await prisma.task.create({
      data: {
        title: validData.title,
        description: validData.description,
        priority: validData.priority,
        status: validData.status,
        dueDate: dueDate,
      },
    });

    // Handle labels if provided
    if (validData.labels && validData.labels.length > 0) {
      for (const labelData of validData.labels) {
        // First check if the label exists
        let labelId: string;

        const existingLabel = await prisma.label.findFirst({
          where: {
            name: labelData.name
          }
        });

        if (existingLabel) {
          labelId = existingLabel.id;
        } else {
          // If label doesn't exist, create it first
          const newLabel = await prisma.label.create({
            data: {
              name: labelData.name,
              color: labelData.color,
              icon: labelData.icon
            }
          });

          labelId = newLabel.id;
        }

        // Connect the label to the task using Prisma's API
        await prisma.task.update({
          where: { id: task.id },
          data: {
            labels: {
              connect: { id: labelId }
            }
          }
        });
      }
    }

    // Fetch the task with labels
    const taskWithLabels = await prisma.task.findUnique({
      where: { id: task.id },
      include: { labels: true }
    });

    if (!taskWithLabels) {
      throw new Error('Failed to retrieve task with labels');
    }

    return NextResponse.json(taskWithLabels);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', message: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Retrieves all tasks
 * @returns List of tasks or error response
 */
export async function GET(): Promise<NextResponse> {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        labels: true,
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', message: (error as Error).message },
      { status: 500 }
    );
  }
}
