import { PrismaClient } from '@prisma/client';
import { Alarm } from '@prisma/client';
const prisma = new PrismaClient();

export class AlarmService {
  static async createAlarm(data: { title: string; description: string; imageUrl?: string; audioUrl?: string }): Promise<Alarm> {
    return prisma.alarm.create({
      data,
    });
  }

  static async getAllAlarms(): Promise<Alarm[]> {
    return prisma.alarm.findMany();
  }

  static async getAlarmById(id: string): Promise<Alarm | null> {
    return prisma.alarm.findUnique({
      where: { id },
    });
  }

  static async updateAlarm(id: string, data: { title?: string; description?: string; imageUrl?: string; audioUrl?: string }): Promise<Alarm> {
    return prisma.alarm.update({
      where: { id },
      data,
    });
  }

  static async deleteAlarm(id: string): Promise<Alarm> {
    return prisma.alarm.delete({
      where: { id },
    });
  }
}
