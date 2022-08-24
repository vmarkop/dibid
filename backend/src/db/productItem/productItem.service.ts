import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductResponse, SearchProps } from 'src/dto/product.interface';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Category } from '../category/category.entity';
import { CategoryService } from '../category/category.service';
import { UserService } from '../user/user.service';
import { ProductItem } from './productItem.entity';

@Injectable()
export class ProductItemService {
  constructor(
    @InjectRepository(ProductItem)
    private productRepository: Repository<ProductItem>,
    private readonly userService: UserService,
    private readonly categoryService: CategoryService
  ) { }

  async getProductById(id: number): Promise<ProductResponse> {
    const product: ProductItem = await this.productRepository.findOneBy({ productId: id })
    if (product) {

      return {
        productId: id,
        name: product.name,
        categories: await this.categoryService.getProductCategories(product.productId),
        imgUrl: product.imgUrl,
        currentBid: product.currentBid,
        buyPrice: product.buyPrice,
        firstBid: product.firstBid,
        numberOfBids: product.numberOfBids,
        startingDate: product.startingDate,
        endingDate: product.endingDate,    
        description: product.description,
        location: product.location,
        longitude: product.longitude,
        latitude: product.latitude,
      }
    }
    else {
      return {
        productId: -1,
        name: "",
        categories: [],
        imgUrl: "",
        currentBid: 0,
        buyPrice: 0,
        firstBid: 0,
        numberOfBids: 0,
        startingDate: 0,
        endingDate: 0,    
        description: "",
        location: "",
        longitude: 0,
        latitude: 0,
      }
    }
  }

  async getProductEntityById(id: number): Promise<ProductItem> {
    return await this.productRepository.findOneBy({ productId: id })
  }

  async getAllProductIds(): Promise<number[]> {
    const res: number[] = []
    const products: ProductItem[] =  await this.productRepository.find();
    products.forEach(product => {
      res.push(product.productId);
    });
    return res;
  }

  async getAllActiveIds(): Promise<number[]> {
    const res: number[] = []
    const products: ProductItem[] =  await this.productRepository.findBy({active: true});
    products.forEach(product => {
      res.push(product.productId);
    });
    return res;
  }

  async getAllActiveProducts(): Promise<ProductItem[]> {
    return await this.productRepository.findBy({active: true});
  }

  async getAllProducts(): Promise<ProductItem[]> {
    // return await this.productRepository.find();

    const products: ProductItem[] = await this.productRepository
      .createQueryBuilder("products")
      .leftJoinAndSelect("products.seller", "user")
      .getMany();

    return products;
  }

  // Set all items that have expired to active: false
  async updateAllActiveProducts(): Promise<void> {

    const time: number = +new Date();

    await this.productRepository
      .createQueryBuilder()
      .update('products')
      .set({active: false})
      .where('products.active = true')
      .andWhere('products.endingDate < :endingDate', {endingDate: time})
      .execute();
  }

  async insertProduct(product: ProductItem, username: string): Promise<{ 'success': boolean }> {
    console.log('test!!!');
    await this.productRepository.save(product);
    // await this.UserService.connectUserToProduct(username, product);
    return { "success": true }
  }

  async updateItemAfterBid(productId: number, bid: number): Promise<{ 'success': boolean }> {

    const product: ProductItem = await this.getProductEntityById(productId);
    const numberOfBids: number = product.numberOfBids + 1;

    await this.productRepository
      .createQueryBuilder()
      .update("products")
      .set({ numberOfBids: numberOfBids, currentBid: bid, active: bid !== product.buyPrice })
      .where("products.productId = :productId", { productId: productId })
      .execute();
    return { success: true };
  }

  // Get a list of Product IDs from a category ID
  async getCategoryProducts(categoryId: number): Promise<number[]> {

    const Products: number[] = [];
    
    const products = await this.productRepository
      .createQueryBuilder("products")
      .leftJoinAndSelect("products.categories", "categories")
      .where("categories.id = :categoryId", { categoryId: categoryId })
      .getMany();

      products.forEach(product => {
        Products.push(product.productId)
      });
      return Products;
  }

  // Get a list of active Product IDs from a category ID
  async getActiveCategoryProducts(categoryId: number): Promise<number[]> {

    const Products: number[] = [];
    
    const products = await this.productRepository
      .createQueryBuilder("products")
      .leftJoinAndSelect("products.categories", "categories")
      .where("categories.id = :categoryId", { categoryId: categoryId })
      .andWhere('products.active = 1')
      .getMany();

      products.forEach(product => {
        Products.push(product.productId)
      });
      return Products;
  }

  // Get a list of Product IDs from a user ID
  async getProductsByUserWithId(userId: string): Promise<number[]> {
    const Products: number[] = [];

    const products = await this.productRepository
      .createQueryBuilder('products')
      .where('products.seller = :userId', { userId: userId })
      .getMany();

    products.forEach(product => {
      Products.push(product.productId)
    });
    return Products;
  }

  // Get a list of Product IDs from a search text, ordered by relevance
  async searchProducts(props: SearchProps): Promise<number[]> {
    const Products: number[] = [];

    console.log('propas: ', props);

    var products: ProductItem[];
    var query: SelectQueryBuilder<ProductItem>;

    // 1. Search titles like full searchText string
    query = this.productRepository
      .createQueryBuilder('products')
      .where('products.name LIKE :searchText', { searchText: '%' + props.searchText + '%' });
    products = await this.enhanceSearchQuery(query, props).getMany();
    
    for (const product of products) {
      Products.push(product.productId);
    }

    // 2. Search descriptions like full searchText string
    query = this.productRepository
      .createQueryBuilder('products')
      .where('products.description like :searchText', { searchText: '%' + props.searchText + '%' });
    products = await this.enhanceSearchQuery(query, props).getMany();
    
    for (const product of products) {
      if ( !Products.includes(product.productId) )
        Products.push(product.productId);
    }

    
    // 3. Split searchText in terms with length > 2
    const searchSplit: string[] = props.searchText.split(' ');

    const isLongEnough = (str: string) => {
      return str.length > 2;
    }

    const searchTerms = searchSplit.filter(isLongEnough);

    const TitleProducts: number[] = [];
    const DescProducts: number[] = [];

    // 4. For each term:
    for (const term of searchTerms) {

      console.log('term: ', term);
      
      // 4.1. Search titles like term
      query = this.productRepository
        .createQueryBuilder('products')
        .where('products.name LIKE :term', { term: '%' + term + '%' });
      products = await this.enhanceSearchQuery(query, props).getMany();

      for (const product of products) {
        if ( !TitleProducts.includes(product.productId) )
          TitleProducts.push(product.productId);
      }

      // 4.2. Search descriptions like term
      query = this.productRepository
        .createQueryBuilder('products')
        .where('products.description LIKE :term', { term: '%' + term + '%' });
      products = await this.enhanceSearchQuery(query, props).getMany();
      
      for (const product of products) {
        if ( !DescProducts.includes(product.productId) )
          DescProducts.push(product.productId);
      }

      // 4.3. Search for location = term (TODO)

    }

    for (const product of TitleProducts) {
      if ( !Products.includes(product) )
        Products.push(product);
    }

    for (const product of DescProducts) {
      if ( !Products.includes(product) )
        Products.push(product);
    }


    return Products;
  }

  enhanceSearchQuery (query: SelectQueryBuilder<ProductItem>, props: SearchProps): SelectQueryBuilder<ProductItem> {

    let enhancedQuery: SelectQueryBuilder<ProductItem> = query;

    // Handle minBid/maxBid
    if (props.minBid && props.maxBid)
      enhancedQuery = enhancedQuery
        .andWhere('products.currentBid BETWEEN :minBid AND :maxBid', {minBid: props.minBid, maxBid: props.maxBid})
    else if (props.minBid && !props.maxBid)
      enhancedQuery = enhancedQuery
        .andWhere('products.currentBid >= :minBid', {minBid: props.minBid})
    else if (!props.minBid && props.maxBid)
      enhancedQuery = enhancedQuery
          .andWhere('products.currentBid <= :maxBid', {maxBid: props.maxBid})
    
    // Handle minBuyNow/maxBuyNow
    if (props.minBuyNow && props.maxBuyNow)
      enhancedQuery = enhancedQuery
        .andWhere('products.buyPrice BETWEEN :minBuyNow AND :maxBuyNow', {minBuyNow: props.minBuyNow, maxBuyNow: props.maxBuyNow})
    else if (props.minBuyNow && !props.maxBuyNow)
      enhancedQuery = enhancedQuery
        .andWhere('products.buyPrice >= :minBuyNow', {minBuyNow: props.minBuyNow})
    else if (!props.minBuyNow && props.maxBuyNow)
      enhancedQuery = enhancedQuery
          .andWhere('products.buyPrice <= :maxBuyNow', {maxBuyNow: props.maxBuyNow})

    // Handle category
    if (props.category) {
      enhancedQuery = enhancedQuery
        .leftJoinAndSelect("products.categories", "categories")
        .andWhere("categories.id = :categoryId", { categoryId: props.category })
    }

    return enhancedQuery;
  }
}