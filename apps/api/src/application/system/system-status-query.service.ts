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
    console.log('[debug] systemStatus query received');
    
    const setting = await this.dataSource
      .getRepository(ApplicationSettingEntity)
      .findOneByOrFail({ key: ApplicationSettingKey.SYSTEM_STATE });

      console.log('System state setting:', setting);
    return setting.textValue ?? 'UNINITIALIZED';
  }
}
