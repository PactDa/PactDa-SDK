import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Api } from './api.entity';
import { CoinStruct, SuiClient } from '@mysten/sui.js/dist/cjs/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { CreateAgreementDto } from './dto/create-agreement.dto';
import { ApiKeyService } from 'src/apikey/api-key.service';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { ConfigService } from '@nestjs/config';
import { FundEscrowDto } from './dto/fund-the-escrow.dto';

@Injectable()
export class ApiService implements OnModuleInit {
  constructor(
    @InjectRepository(Api)
    private apiRepository: Repository<Api>,
    @Inject('SUI_CLIENT')
    private readonly suiClient: { client: SuiClient; keypair: Ed25519Keypair },
    private readonly configService: ConfigService,
  ) { }

  async findAll(): Promise<Api[]> {
    return this.apiRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Api | null> {
    return this.apiRepository.findOne({ where: { id } });
  }

  async findActive(): Promise<Api[]> {
    return this.apiRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findByPath(path: string): Promise<Api | null> {
    return this.apiRepository.findOne({ where: { path } });
  }

  async findByMethod(method: string): Promise<Api[]> {
    return this.apiRepository.find({
      where: { method },
      order: { name: 'ASC' },
    });
  }

  async create(apiData: Partial<Api>): Promise<Api> {
    const api = this.apiRepository.create(apiData);
    return this.apiRepository.save(api);
  }

  async update(id: number, apiData: Partial<Api>): Promise<Api | null> {
    await this.apiRepository.update(id, apiData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.apiRepository.delete(id);
  }

  async activate(id: number): Promise<Api | null> {
    await this.apiRepository.update(id, { isActive: true });
    return this.findOne(id);
  }

  async deactivate(id: number): Promise<Api | null> {
    await this.apiRepository.update(id, { isActive: false });
    return this.findOne(id);
  }

  async findByTags(tags: string): Promise<Api[]> {
    return this.apiRepository.find({
      where: { tags },
      order: { name: 'ASC' },
    });
  }

  async onModuleInit() {
    const routesToSave: Partial<Api>[] = [
      {
        name: 'CreateAgreement',
        path: '/api/create-agreement',
        method: 'POST',
        description: 'create agreement contract',
        tags: null,
        isActive: true,
      },
      {
        name: 'FundTheEscrow',
        path: '/api/fund-the-escrow',
        method: 'POST',
        description: 'Add funds to the contract escrow account.',
        tags: null,
        isActive: true,
      },
    ];
    const existingRoutes = await this.apiRepository.find();

    const newRouteMap = new Map<string, Partial<Api>>();
    for (const route of routesToSave) {
      const key = `${route.method}:${route.path}`;
      newRouteMap.set(key, route);
    }

    for (const [key, route] of newRouteMap.entries()) {
      const [method, path] = key.split(':');
      const existing = existingRoutes.find(
        (r) => r.method === method && r.path === path,
      );

      if (existing) {
        await this.apiRepository.update(existing.id, route);
      } else {
        await this.apiRepository.save(this.apiRepository.create(route));
      }
    }

    for (const route of existingRoutes) {
      const key = `${route.method}:${route.path}`;
      if (!newRouteMap.has(key)) {
        await this.apiRepository.delete(route.id);
      }
    }
  }

  async createAgreementContract(dto: CreateAgreementDto) {
    const PACKAGE_ID = this.configService.get<string>('PACKAGE_ID');
    const MODULE_NAME = this.configService.get<string>('MODULE_NAME');
    const FUNCTION_NAME = this.configService.get<string>('CREATE_AGREEMENT_FUNCTION_NAME');
    const AUTHORITY_ADDRESS = this.configService.get<string>('SUI_AUTHORITY_ADDRESS');
    const CLOCK_ID = this.configService.get<string>('CLOCK_ID') as string;

    const tx = new TransactionBlock();

    const sanitizedPartyAddresses = dto.partyAddresses.map((addr) => {
      if (!addr || typeof addr !== 'string') {
        throw new BadRequestException('Invalid address in partyAddresses');
      }
      return addr.trim();
    });

    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTION_NAME}`,
      arguments: [
        tx.pure(sanitizedPartyAddresses, 'vector<address>'),
        tx.pure(AUTHORITY_ADDRESS, 'address'),
        tx.pure(dto.contractTitle, 'string'),
        tx.pure(dto.creatorAddress, 'address'),
        tx.object(CLOCK_ID),
      ],
      typeArguments: [],
    });

    const result = await this.suiClient.client.signAndExecuteTransactionBlock({
      signer: this.suiClient.keypair,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    return result;
  }

  async FundEscrow(dto: FundEscrowDto) {
    const PACKAGE_ID = this.configService.get<string>('PACKAGE_ID');
    const MODULE_NAME = this.configService.get<string>('MODULE_NAME');
    const FUNCTION_NAME = this.configService.get<string>('FUND_THE_ESCROW_FUNCTION_NAME');
    const CLOCK_ID = this.configService.get<string>('CLOCK_ID') as string;

    const coins = await this.suiClient.client.getCoins({
      owner: this.suiClient.keypair.getPublicKey().toSuiAddress(),
      coinType: '0x2::sui::SUI',
    });
    console.log(coins)

    if (!coins.data.length) {
      throw new BadRequestException('No SUI coins available in server wallet');
    }

    const requiredAmount = BigInt(dto.totalCoinMist);
    let sum = BigInt(0);
    const coinObjectsForMerge: CoinStruct[] = [];

    for (const coin of coins.data) {
      sum += BigInt(coin.balance);
      coinObjectsForMerge.push(coin);
      if (sum >= requiredAmount) break;
    }
    console.log(coinObjectsForMerge)

    if (sum < requiredAmount) {
      throw new BadRequestException(`Insufficient balance. Available: ${sum.toString()}, Required: ${requiredAmount.toString()}`);
    }

    const tx = new TransactionBlock();

    const coinInput = tx.mergeCoins(
      tx.object(coinObjectsForMerge[0].coinObjectId),
      coinObjectsForMerge.slice(1).map(c => tx.object(c.coinObjectId))
    );

    const [splitCoins] = tx.splitCoins(coinInput, [tx.pure(dto.totalCoinMist)]);

    if (!splitCoins) {
      throw new BadRequestException('Failed to split coins. Possibly invalid amount');
    }
    console.log('contractId:', dto.contractId);
    console.log('escrowId:', dto.escrowId);
    console.log('amountCoin:', [splitCoins], splitCoins);
    console.log('CLOCK_ID:', CLOCK_ID);
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${FUNCTION_NAME}`,
      arguments: [
        tx.object(dto.contractId),
        tx.object(dto.escrowId),
        tx.object(splitCoins),
        tx.object(CLOCK_ID),
      ],
      typeArguments: ['0x2::sui::SUI'],
    });

    const result = await this.suiClient.client.signAndExecuteTransactionBlock({
      signer: this.suiClient.keypair,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    return result;
  }
}
