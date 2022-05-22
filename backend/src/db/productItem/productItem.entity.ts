import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Bid } from '../bid/bid.entity';
import { BidsTable } from '../bids/bids.entity';
import { Location } from '../location/location.entity';

@Entity({ name: 'products', synchronize: true })
export class ProductItem {

  @PrimaryGeneratedColumn()
  productId!: number;

  @Column()
  name: string;

  @Column('float')
  currentBid: number;

  @Column()
  imgUrl: string;

  @Column('float',{ nullable: true, default: null })
  buyPrice: number | null;

  @Column('float')
  firstBid: number;

  @Column()
  numberOfBids: number;

  @Column()
  startingDate: number;

  @Column()
  endingDate: number;

  @Column()
  description: string;

  @OneToOne(() => Location, (location) => location.id)
  location: Location;

  @OneToOne(() => BidsTable, (bidsTable) => bidsTable.product)
  bidsTable: Bid[];

  @ManyToOne(() => User, (seller) => seller.products)
  seller: User;
}