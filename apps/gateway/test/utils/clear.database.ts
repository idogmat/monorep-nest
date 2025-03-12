import { PrismaService } from '../../src/feature/prisma/prisma.service';

export const clearDatabase = async (prisma: PrismaService) => {
  await prisma.user.deleteMany();  // Очистка таблицы users, можешь добавить другие таблицы по аналогии
  // Добавь очистку других таблиц, если необходимо:
  // await prisma.anotherTable.deleteMany();
};