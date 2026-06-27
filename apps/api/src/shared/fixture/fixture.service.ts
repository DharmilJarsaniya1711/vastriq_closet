import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AbstractFixture } from './abstractFixture.service';

@Injectable()
export class FixturesService {
  constructor(private readonly prismaService: PrismaService) {}

  async importFixtures(fixtures: any[]) {
    process.env.FIXTURE_ENV = 'true';
    for (const model of Prisma.dmmf.datamodel.models) {
      const prismaModel = this.prismaService[model.name];
      await prismaModel.deleteMany({});
    }
    const fixturesLoaded = new Map<string, boolean>();

    for (const fixture of fixtures) {
      await this.import(fixture, fixtures, fixturesLoaded);
    }
  }

  private async import(
    f: AbstractFixture,
    allFixtures: AbstractFixture[],
    fixturesLoaded: Map<string, boolean>
  ): Promise<any> {
    if (fixturesLoaded.get(f.name)) {
      return Promise.resolve();
    }

    if (f.dependsOn && f.dependsOn.length > 0) {
      // Load all the dependencies before this fixture:
      for (let c = 0; c < f.dependsOn.length; c++) {
        const type = f.dependsOn[c];
        const fixtureDependant = allFixtures.find((fix) => fix.name === type.name);
        if (!fixtureDependant) {
          throw new Error(
            `Fixture ${f.name} depends on ${type.name} that was not included in the loadFixtures call or in the Module providers`
          );
        }

        await this.import(fixtureDependant, allFixtures, fixturesLoaded);
      }
    }

    fixturesLoaded.set(f.name, true);
    const p = await f.load();
    return p;
  }
}
