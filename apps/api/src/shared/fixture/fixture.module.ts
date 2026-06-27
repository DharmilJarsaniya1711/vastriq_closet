import { Global, Module } from '@nestjs/common';
import { Fixtures } from '../../console/fixtures.command';
import { FixturesService } from './fixture.service';
import { FixtureReferenceService } from './fixtureReference.service';
import { DiscoveryModule } from '@nestjs/core';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [Fixtures, FixturesService, FixtureReferenceService],
  exports: [Fixtures, FixturesService, FixtureReferenceService],
})
export class FixturesModule {}
