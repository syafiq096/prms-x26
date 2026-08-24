import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ApplicationSettingEntity,
  ApplicationSettingKey,
} from '../../database/entities';

@Injectable()
export class SystemStatusQueryService {
  constructor(private readonly dataSource: DataSource) {}

  async state(): Promise<string> {
    const setting = await this.dataSource
      .getRepository(ApplicationSettingEntity)
      .findOneByOrFail({ key: ApplicationSettingKey.SYSTEM_STATE });
    return setting.textValue ?? 'UNINITIALIZED';
  }
}
