import { 
  Connection, 
  PublicKey, 
  GetProgramAccountsFilter, 
  ParsedTransactionWithMeta,
  ParsedInstruction,
  PartiallyDecodedInstruction,
  ParsedMessageAccount,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const RPC_ENDPOINT = 'https://go.getblock.io/3ef4b44a47f343329a0afb8fe23016fa'; 
const RPC_ENDPOINT2 = 'https://solana-mainnet.g.alchemy.com/v2/0XEUOjCO9i2kagRy0APOVHObWm8Gc6vz'; 

interface Transaction {
  signature: string;
  timestamp: string;
  status: 'success' | 'failed';
  instructions: { programId: string }[];
}

interface TokenAccount {
  tokenAccountAddress: string;
  mintAddress: string;
  balance: number;
}

async function fetchRecentTransactions(walletAddress: string, limit: number = 10): Promise<Transaction[]> {
  const connection = new Connection(RPC_ENDPOINT2);
  const pubKey = new PublicKey(walletAddress);
  
  const signatures = await connection.getSignaturesForAddress(pubKey, { limit });
  const transactions = await connection.getParsedTransactions(
    signatures.map(sig => sig.signature),
    { maxSupportedTransactionVersion: 0 }
  );
  
  return transactions.map((tx, index) => ({
    signature: signatures[index].signature,
    timestamp: tx?.blockTime ? new Date(tx.blockTime * 1000).toISOString() : '',
    status: tx?.meta?.err ? 'failed' : 'success',
    instructions: tx ? parseInstructions(tx) : [],
  }));
}

function parseInstructions(tx: ParsedTransactionWithMeta | null): { programId: string }[] {
  if (!tx || !tx.transaction.message.instructions) return [];

  return tx.transaction.message.instructions.map(instruction => ({
    programId: getProgramId(instruction),
  }));
}

function getProgramId(instruction: ParsedInstruction | PartiallyDecodedInstruction): string {
  if ('programId' in instruction) {
    return instruction.programId.toString();
    // @ts-ignore
  } else if ('parsed' in instruction && 'program' in instruction.parsed) {
    // @ts-ignore
    return instruction.parsed.program;
  }
  return 'Unknown';
}

async function fetchAllTokens(walletAddress: string): Promise<TokenAccount[]> {
  const connection = new Connection(RPC_ENDPOINT);
  const pubKey = new PublicKey(walletAddress);

  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165,
    },
    {
      memcmp: {
        offset: 32,
        bytes: pubKey.toBase58(),
      },
    },
  ];

  const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, { filters });

  return accounts.map(account => {
    const parsedAccountInfo = account.account.data;
    if ('parsed' in parsedAccountInfo) {
      const mintAddress = parsedAccountInfo.parsed.info.mint;
      const tokenBalance = parsedAccountInfo.parsed.info.tokenAmount.uiAmount;

      return {
        tokenAccountAddress: account.pubkey.toString(),
        mintAddress,
        balance: tokenBalance,
      };
    } else {
      throw new Error('Unexpected account data format');
    }
  });
}

async function getSolBalance(walletAddress: string): Promise<number> {
  const connection = new Connection(RPC_ENDPOINT);
  const pubKey = new PublicKey(walletAddress);
  
  const balance = await connection.getBalance(pubKey);
  return balance / LAMPORTS_PER_SOL;
}

export {
  fetchRecentTransactions,
  fetchAllTokens,
  getSolBalance,
};
export type { Transaction, TokenAccount };
