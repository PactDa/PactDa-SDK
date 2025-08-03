import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

import { ConfigService } from '@nestjs/config';

export const SuiProvider = {
  provide: 'SUI_CLIENT',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const mnemonic_phrase = config.get<string>('SUI_mnemonic_phrase');
    const SUI_ENVIRONMENT = config.get<'mainnet' | 'testnet' | 'devnet' | 'localnet'>(
      'SUI_ENVIROMENT',
    );
    if (!mnemonic_phrase) throw new Error('SUI_mnemonic_phrase is not defined');
    if (!SUI_ENVIRONMENT) throw new Error('SUI_ENVIROMENT is not defined');

    const client = new SuiClient({ url: getFullnodeUrl(SUI_ENVIRONMENT) });
    const keypair = Ed25519Keypair.deriveKeypair(mnemonic_phrase);
    return { client, keypair };
  },
};
