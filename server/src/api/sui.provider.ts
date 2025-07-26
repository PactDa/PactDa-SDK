import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/bcs';

const PRIVATE_KEY = process.env.SUI_PRIVATE_KEY;
const SUI_ENVIROMENT = process.env.SUI_ENVIROMENT as 'mainnet' | 'testnet' | 'devnet' | 'localnet';


export const SuiProvider = {
    provide: 'SUI_CLIENT',
    useFactory: () => {
        const client = new SuiClient({ url: getFullnodeUrl(SUI_ENVIROMENT) });
        if (!PRIVATE_KEY) {
            throw new Error('PRIVATE_KEY is not defined');
        }
        const privateKeyArray = fromB64(PRIVATE_KEY);
        const keypair = Ed25519Keypair.fromSecretKey(privateKeyArray.slice(1));

        return {
            client,
            keypair,
        };
    },
};
