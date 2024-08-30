import { useEffect, useState } from 'react';
import { Box, Flex, Text, Table, Thead, Tbody, Tr, Th, Td, Spinner, Grid, Card, CardHeader, CardBody, Badge, Tooltip, Link, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Navbar } from '@/components/Navbar';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchRecentTransactions, fetchAllTokens, getSolBalance, Transaction, TokenAccount } from '@/util/fetchData';

export default function Home() {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (publicKey) {
        setLoading(true);
        try {
          const [txs, tokenAccounts, balance] = await Promise.all([
            fetchRecentTransactions(publicKey.toString()),
            fetchAllTokens(publicKey.toString()),
            getSolBalance(publicKey.toString())
          ]);
          setTransactions(txs);
          setTokens(tokenAccounts);
          setSolBalance(balance);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        setLoading(false);
      }
    }

    fetchData();
  }, [publicKey]);

  const nonZeroTokens = tokens.filter(token => token.balance > 0);
  const zeroBalanceTokens = tokens.length - nonZeroTokens.length;

  return (
    <Box bg="gray.50" minH="100vh">
      <Navbar />
      <Box maxW="1200px" mx="auto" p={6}>
        <Text fontSize="3xl" fontWeight="bold" mb={6}>Wallet Dashboard</Text>

        {!publicKey ? (
          <Text>Please connect your wallet to view the dashboard.</Text>
        ) : loading ? (
          <Spinner size="xl" />
        ) : (
          <>
            <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={6} mb={6}>
              <Card>
                <CardHeader>
                  <Text fontSize="xl" fontWeight="semibold">SOL Balance</Text>
                </CardHeader>
                <CardBody>
                  <Stat>
                    <StatNumber fontSize="3xl">{solBalance?.toFixed(4)} SOL</StatNumber>
                    <StatHelpText>
                      <Link href={`https://solscan.io/account/${publicKey.toString()}`} isExternal color="blue.500">
                        View on Solscan <ExternalLinkIcon mx="2px" />
                      </Link>
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
              <Card>
                <CardHeader>
                  <Text fontSize="xl" fontWeight="semibold">Token Balances</Text>
                </CardHeader>
                <CardBody>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Token</Th>
                        <Th isNumeric>Balance</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {nonZeroTokens.map((token) => (
                        <Tr key={token.tokenAccountAddress}>
                          <Td>
                            <Tooltip label={token.mintAddress}>
                              <Text>{token.mintAddress.slice(0, 4)}...{token.mintAddress.slice(-4)}</Text>
                            </Tooltip>
                          </Td>
                          <Td isNumeric>{token.balance.toLocaleString()}</Td>
                          <Td>
                            <Link href={`https://solscan.io/account/${token.tokenAccountAddress}`} isExternal color="blue.500">
                              <ExternalLinkIcon />
                            </Link>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {zeroBalanceTokens > 0 && (
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      {zeroBalanceTokens} other token account{zeroBalanceTokens > 1 ? 's' : ''} with 0 balance
                    </Text>
                  )}
                </CardBody>
              </Card>
            </Grid>

            <Card>
              <CardHeader>
                <Text fontSize="xl" fontWeight="semibold">Recent Transactions</Text>
              </CardHeader>
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Signature</Th>
                      <Th>Timestamp</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.map((tx) => (
                      <Tr key={tx.signature}>
                        <Td>
                          <Tooltip label={tx.signature}>
                            <Text>{tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}</Text>
                          </Tooltip>
                        </Td>
                        <Td>{new Date(tx.timestamp).toLocaleString()}</Td>
                        <Td>
                          <Badge colorScheme={tx.status === 'success' ? 'green' : 'red'}>
                            {tx.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Link href={`https://solscan.io/tx/${tx.signature}`} isExternal color="blue.500">
                            <ExternalLinkIcon />
                          </Link>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </>
        )}
      </Box>
    </Box>
  );
}