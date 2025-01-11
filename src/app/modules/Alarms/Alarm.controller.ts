import { Request, Response } from 'express';
import { AlarmService } from './Alerm.service';

export class AlarmController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, description } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const audioUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

      const alarm = await AlarmService.createAlarm({ title, description, imageUrl, audioUrl });
      res.status(201).json(alarm);
    } catch (error) {
      res.status(400).json({ error: 'Error creating alarm' });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const alarms = await AlarmService.getAllAlarms();
      res.json(alarms);
    } catch (error) {
      res.status(400).json({ error: 'Error fetching alarms' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const alarm = await AlarmService.getAlarmById(Number(id));
      if (alarm) {
        res.json(alarm);
      } else {
        res.status(404).json({ error: 'Alarm not found' });
      }
    } catch (error) {
      res.status(400).json({ error: 'Error fetching alarm' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { title, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const audioUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const alarm = await AlarmService.updateAlarm(Number(id), { title, description, imageUrl, audioUrl });
      res.json(alarm);
    } catch (error) {
      res.status(400).json({ error: 'Error updating alarm' });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const alarm = await AlarmService.deleteAlarm(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Error deleting alarm' });
    }
  }
}
