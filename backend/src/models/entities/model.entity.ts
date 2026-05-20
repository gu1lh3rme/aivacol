import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity({ name: 'models' })
export class ModelEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => Brand, (brand) => brand.models, {
    eager: true,
    onDelete: 'CASCADE',
  })
  brand!: Brand;

  @Column()
  brandId!: number;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.model)
  vehicles?: Vehicle[];
}
