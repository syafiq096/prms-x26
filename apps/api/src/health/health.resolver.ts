import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { DataSource } from 'typeorm';

@ObjectType()
export class Health {
  @Field() status!: string;
  @Field() timestamp!: string;
  @Field() database!: string;
}

@Resolver(() => Health)
export class HealthResolver {
  constructor(private readonly dataSource: DataSource) {}

  @Query(() => Health)
  health(): Health {
    return { status: 'ok', timestamp: new Date().toISOString(), database: this.dataSource.isInitialized ? 'up' : 'down' };
  }
}
