import { Global, Module } from '@nestjs/common';
import { NativePostgresService } from './native.service';

@Global()
@Module({
  providers: [NativePostgresService],
  exports: [NativePostgresService],
})
export class NativeModule {}
