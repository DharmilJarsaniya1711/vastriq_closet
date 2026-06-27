import { Injectable } from '@nestjs/common';
import { AbstractSeeder } from './abstractSeeder.service';

@Injectable()
export class SeederService {
  async runSeeder(seeders: AbstractSeeder[]) {
    for (const seeder of seeders) {
      await seeder.seed();
    }
  }
}
