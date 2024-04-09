import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const ConnectWallet = () => {
  const { connected } = useWallet();

  return (
    <div>
      {connected ? (
        <p>Wallet Connected</p>
      ) : (
        <WalletMultiButton />
      )}
    </div>
  );
};

export default ConnectWallet;
