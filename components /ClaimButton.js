import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const ClaimButton = () => {
  const { connected } = useWallet();

  const handleClaim = async () => {
    // demand logic
  };

  return (
    <button onClick={handleClaim} disabled={!connected}>
      {connected ? 'Successfully Claimed!' : 'Claim it'}
    </button>
  );
};

export default ClaimButton;
