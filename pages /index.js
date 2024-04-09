import Image from 'next/image';
import ConnectWallet from '../components/ConnectWallet';
import ClaimButton from '../components/ClaimButton';

export default function Home() {
  return (
    <div>
      <header>
        <div>
          {/* l */}
          <Image src="/logo.png" alt="Logo" width={100} height={50} />
        </div>
        <ConnectWallet />
      </header>
      <main>
        <div>
          {/* t */}
          <Image src="/t-shirt.png" alt="T-Shirt" width={300} height={300} />
          <h2>Get Your Swaetshirts Ownership!</h2>
          <ClaimButton />
        </div>
      </main>
      <footer>
        <a href="/web3-wardrobe">Go to your Web3 Wardrobe</a>
      </footer>
    </div>
  );
}
