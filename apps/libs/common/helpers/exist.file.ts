import { access, constants } from "fs/promises";

export async function fileExist(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK)
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}