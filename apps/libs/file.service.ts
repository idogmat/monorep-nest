import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { UserAccounts } from '../gateway/src/feature/payments/eventBus/updateAccount.event';

@Injectable()
export class FileService {
  private readonly sourcePath = join(__dirname, 'remove');
  private readonly source = 'source.json';
  private readonly result = 'result.json';
  constructor() {
    // создаем директорию, если нет
    fs.mkdir(this.sourcePath, { recursive: true }).catch(() => { });
  }
  async appendToJsonFile(newItems: UserAccounts[]) {
    try {
      let existingData: UserAccounts[] = [];
      await this.exists(join(this.sourcePath, this.source));
      try {
        const fileContent = await fs.readFile(join(this.sourcePath, this.source), 'utf-8');
        existingData = fileContent.trim() ? JSON.parse(fileContent) : [];
      } catch (readError) {
        if ((readError as any).code !== 'ENOENT') {
          throw readError;
        }
        // Файл не найден — начнём с пустого массива
      }

      const updatedData = [...existingData, ...newItems];

      await fs.writeFile(join(this.sourcePath, this.source), JSON.stringify(updatedData, null, 2), 'utf-8');
      console.log('✅ Данные успешно добавлены в файл');
    } catch (error) {
      console.error('❌ Ошибка при добавлении данных в файл:', error);
    }
  }

  async processEvents() {
    try {
      await this.exists(join(this.sourcePath, this.source));

      // Копируем файл
      await fs.copyFile(join(this.sourcePath, this.source), join(this.sourcePath, this.result));

      // Очищаем исходный буфер
      await fs.writeFile(join(this.sourcePath, this.source), '[]');

      const data = await fs.readFile(join(this.sourcePath, this.result), 'utf-8');
      const events = JSON.parse(data);
      return events

    } catch (err) {
      console.error('Error during cron event processing:', err);
    }
  }


  async writeFile(content: any): Promise<void> {
    await fs.writeFile(join(this.sourcePath, this.source), JSON.stringify(content, null, 2), 'utf-8');
  }

  async readFile(filename: string): Promise<string> {
    const filePath = join(this.sourcePath, filename);
    return fs.readFile(filePath, 'utf8');
  }

  async deleteFileResult(): Promise<void> {
    const filePath = join(this.sourcePath, this.result);
    await fs.unlink(filePath).catch(() => { });
  }

  async copyFile() {
    try {
      await fs.copyFile(join(this.sourcePath, this.source), join(this.sourcePath, this.result));
      console.log('Файл успешно скопирован');
    } catch (error) {
      console.error('Ошибка при копировании файла:', error);
    }
  }

  private async exists(filePath: string) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

}