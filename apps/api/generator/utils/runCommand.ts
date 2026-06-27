import { exec } from 'child_process';
import chalk from 'chalk';

export default (command = '', output = true) =>
  new Promise((resolve, reject) => {
    try {
      exec(command, (error, stdout) => {
        if (error) {
          if (output) console.log(chalk.red(error));
          reject(error);
        } else if (stdout) {
          if (output) console.log(chalk.blue(stdout));
        }
        resolve(true);
      });
    } catch (err) {
      if (output) console.log(chalk.red(err));
      reject();
    }
  });
