import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
import { CompressedNft } from "..target/types/compressed_nft";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  ValidDepthSizePair,
  SPL_NOOP_PROGRAM_ID,
  createAllocTreeIx,
} from "@solana/spl-account-compression";
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  createCreateTreeInstruction,
} from "@metaplex-foundation/mpl-bubblegum";
import { uris } from "../utils/uri";

describe("compressed-nft", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const wallet = provider.wallet as Wallet;
  const connection = provider.connection;

  const program = anchor.workspace.CompressedNft as Program<CompressedNft>;

  const treeKeypair = Keypair.generate();

  const [treeAuthority] = PublicKey.findProgramAddressSync(
    [treeKeypair.publicKey.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );

  const [dataAccount, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from("seed")],
    program.programId
  );

  before(async () => {
    const maxDepthSizePair: ValidDepthSizePair = {
      maxDepth: 14,
      maxBufferSize: 64,
    };

    const canopyDepth = 0;

    const allocTreeIx = await createAllocTreeIx(
      connection,
      treeKeypair.publicKey,
      wallet.publicKey,
      maxDepthSizePair,
      canopyDepth
    );
    
    const createTreeIx = createCreateTreeInstruction(
      {
        treeAuthority,
        merkleTree: treeKeypair.publicKey,
        payer: wallet.publicKey,
        treeCreator: wallet.publicKey,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      },
      {
        maxBufferSize: maxDepthSizePair.maxBufferSize,
        maxDepth: maxDepthSizePair.maxDepth,
        public: true,
      },
      BUBBLEGUM_PROGRAM_ID
    );

    try {
      const tx = new Transaction().add(allocTreeIx, createTreeIx);
      tx.feePayer = wallet.publicKey;

      const txSignature = await sendAndConfirmTransaction(
        connection,
        tx,
        [treeKeypair, wallet.payer],
        {
          commitment: "confirmed",
          skipPreflight: true,
        }
      );

      console.log(
        `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`
      );

      console.log("Tree Address:", treeKeypair.publicKey.toBase58());
    } catch (err: any) {
      console.error("\nFailed to create merkle tree:", err);
      throw err;
    }

    console.log("\n");
  });

  it("Is initialized!", async () => {
    const tx = await program.methods
      .new([bump])
      .accounts({ dataAccount: dataAccount })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Mint Compressed NFT", async () => {
    const receiver = Keypair.generate().publicKey;

    const randomUri = uris[Math.floor(Math.random() * uris.length)];

    const tx = await program.methods
      .mint(
        randomUri 
      )
      .accounts({ 
        tree_authority: treeAuthority,
        leaf_owner: receiver,
        leaf_delegate: receiver,
        merkle_tree: treeKeypair.publicKey,
        payer: wallet.publicKey,
        tree_delegate: wallet.publicKey,
        noop_address: SPL_NOOP_PROGRAM_ID,
        compression_pid: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        bubblegum_pid: BUBBLEGUM_PROGRAM_ID,
       })
      .rpc({ skipPreflight: true });
    console.log("Your transaction signature", tx);
  });
});
