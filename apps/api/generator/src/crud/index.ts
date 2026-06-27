import * as path from 'path';
import * as fs from 'node:fs/promises';
import runCommand from '../../utils/runCommand';
import { genDto } from './dto';
import { getFolderPathByModelName } from '../../utils/file';
import { genController } from './controller';
import { genService } from './service';
import { FieldWithSearchableFields } from './dto/list';

export const genCRUD = async (modelName: string) => {
  // generate module using nest cli
  await runCommand(`nest g res ${modelName}`, false);

  // delete nest generate files except the *.module.ts file
  await deleteNestGeneratedFiles(modelName);

  const selectedOptionsForSearch: FieldWithSearchableFields[] = await genDto(modelName);
  await genController(modelName);
  await genService(modelName, selectedOptionsForSearch);
};

export const deleteNestGeneratedFiles = async (modelName: string) => {
  const pathToFolder = getFolderPathByModelName(modelName);
  for (const file of await fs.readdir(pathToFolder)) {
    const filePath = path.join(pathToFolder, file);
    const stat = await fs.lstat(filePath);

    if (stat.isDirectory()) {
      await fs.rmdir(filePath, {
        recursive: true,
      });
    } else {
      // if (file.search('module') === -1) await fs.unlink(filePath);
    }
  }
};
