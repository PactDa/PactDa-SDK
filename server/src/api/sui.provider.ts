import { fromB64, fromHex } from "@mysten/bcs";
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { ConfigService } from '@nestjs/config';
import { hexToBytes } from "@noble/hashes/utils";

export const SuiProvider = {
  provide: 'SUI_CLIENT',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const mnemonic_phrase = config.get<string>('SUI_mnemonic_phrase');
    const NETWORK = config.get<'mainnet' | 'testnet' | 'devnet' | 'localnet'>('SUI_ENVIROMENT');
    if (!mnemonic_phrase) throw new Error('SUI_mnemonic_phrase is not defined');
    if (!NETWORK) throw new Error('SUI_ENVIROMENT is not defined');

    const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });
    const keypair = Ed25519Keypair.deriveKeypair(mnemonic_phrase);
    return { client, keypair };
  },
};
