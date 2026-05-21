import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { ModelEntity } from '../../models/entities/model.entity';

@Entity({ name: 'vehicles' })
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  plate!: string;

  @Column()
  brandId!: number;

  @ManyToOne(() => Brand, { eager: true, onDelete: 'NO ACTION' })
  brand!: Brand;

  @Column()
  modelId!: number;

  @ManyToOne(() => ModelEntity, { eager: true, onDelete: 'NO ACTION' })
  model!: ModelEntity;

  @Column('int')
  year!: number;

  @Column({ default: '' })
  color!: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('int', { default: 0 })
  mileage!: number;
}
