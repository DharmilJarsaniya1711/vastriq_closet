import * as inquirer from 'inquirer';
import * as chalk from 'chalk';
import { modelOptions } from './utils/prismaUtils';
import { genCRUD } from './src/crud';

async function bootstrap() {
  const { ts: genType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'ts',
      message: 'Select what you want to generate?',
      choices: ['CRUD', 'DTO', 'Controller', 'Service'],
    },
  ]);

  if (genType !== 'CRUD') {
    console.log(chalk.red('\nCurrently only CRUD is supported!\n'));
    process.exit(0);
  }
  const { ts: modelName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'ts',
      message: 'Select model?',
      choices: modelOptions(),
    },
  ]);
  console.log(chalk.green(`\nGenerating CRUD for ${modelName} model...\n`));

  await genCRUD(modelName);
}

bootstrap();
