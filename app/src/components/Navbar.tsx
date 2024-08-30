import { Flex, Box, Text, Button, useColorModeValue } from "@chakra-ui/react"
import Link from "next/link";
import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

export const Navbar = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1rem"
      bg={bgColor}
      color="gray.600"
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex align="center" mr={5}>
        <Link href="/" passHref>
          <Text fontSize="xl" fontWeight="bold" color="blue.500">
            Decentralized Discussions
          </Text>
        </Link>
      </Flex>

      <Box>
        <WalletMultiButton />
      </Box>
    </Flex>
  )
}