import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ModelEntity } from '../../models/entities/model.entity';

@Entity({ name: 'brands' })
export class Brand {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => ModelEntity, (model) => model.brand)
  models?: ModelEntity[];
}
