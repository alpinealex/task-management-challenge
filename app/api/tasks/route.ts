// app/api/tasks/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Parse the dueDate string to a proper Date object if it exists
    const dueDate = data.dueDate ? new Date(data.dueDate) : null;
    
    // Validate that the date is valid before saving
    if (data.dueDate && isNaN(dueDate!.getTime())) {
      return NextResponse.json(
        { error: 'Invalid due date format' },
        { status: 400 }
      );
    }
    
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: dueDate,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        dueDate: 'asc',
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
