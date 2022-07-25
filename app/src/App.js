import { useState } from "react";
import {
  PublicKey, 
  Connection, 
  clusterApiUrl, 
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import "./styles.css";
import idl from "./idl.json"
import * as anchor from "@project-serum/anchor";
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';  // THIS CAUSES "CRYPTO" MODULE ERROR
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
require('@solana/wallet-adapter-react-ui/styles.css');

const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  new PhantomWalletAdapter()
  // getPhantomWallet()
]
const { SystemProgram, Keypair } = web3;

const program_address = "3ERnPj1gQnKzagvWCjqZGskJszcLhunXuLfYqjuSvxBW";
const programID = new PublicKey(program_address);
console.log("programID:", programID)
const opts = {
  preflightCommitment: "processed"
}
const network = clusterApiUrl('devnet');
const TOKEN_ESCROW_PDA_SEED = "token_escrow_seed";
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const tokenmint = new PublicKey("itUKBea2APSEQfSibh3zMMCexaeJ1sWXHLoRj6TJX3N");  // token-address
var seed = null;
var sender_keypair = null;
var receiver_keypair = null;
window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {
  const wallet = useWallet();
  console.log("Wallet Status:", wallet.connected)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [transactionMode, setTransactionMode]   = useState('Trans: Not selected');
  // const [connectWallet, setConnectWallet] = useState('Not Connected');

  const [rkey, setRkey] = useState('');
  const [sol_amount, setAmount] = useState('');
  // const [starttime, setStartTime] = useState('');

  // const senderaddress = "uyZFLgTNT2j6enw7wUKbawBJdB7Hj5tqVMUxN6TgV9x";

  const handleChange = e => {
    setTransactionMode(e.target.value)
  };

  // async function ConnectWallet(e){
  //   // console.log(e.target.value)
  //   try {
  //     // const resp = await window.solana.connect();
  //     // console.log(resp.publicKey.toString())

  //     await window.solana.connect();
  //     window.solana.connect({ onlyIfTrusted: true });  // eagarly connection
  //     console.log(window.solana.publicKey.toString())
  //     // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo 
  //   } catch (err) {
  //       // { code: 4001, message: 'User rejected the request.' }
  //   }
  //   setConnectWallet('Connected')
  // }

  // Connecting to the DevNet
  // const connection = new Connection(clusterApiUrl("devnet"));

  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const network = clusterApiUrl('devnet');
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new AnchorProvider(
      connection, wallet, opts.preflightCommitment,
    );
    await window.solana.connect();
    // console.log(window.solana.publicKey.toString())
    return provider;
  }

  async function transferNativeToken() {
    /* create a provider that will establish a connection to the solana network */
    const provider = await getProvider();

    /* This supposedly works only on test code */
    // const provider = anchor.AnchorProvider.env()
    // anchor.setProvider(provider);

    /* create the program interface combining the idl, program ID, and provider */
    const program = new Program(idl, programID, provider);
    console.log("programme:", program)

    const sender_address = "uyZFLgTNT2j6enw7wUKbawBJdB7Hj5tqVMUxN6TgV9x";
    console.log('rkey:', rkey)
    console.log("amount (from front-end):", sol_amount)
    console.log("amount type (from front-end):", typeof sol_amount)
    const start_time = Math.floor(Date.now()/1000);
    console.log("start_time:", start_time)
    const amount = (sol_amount * LAMPORTS_PER_SOL).toString();
    console.log("amount:", amount)
    console.log("amount type:", typeof amount)

    const ESCROW_PDA_SEED = "escrow_seed";
    const TOKEN_ESCROW_PDA_SEED = "token_escrow_seed";
    const vault = anchor.web3.Keypair.generate();
    console.log("Logged in wallet address:", window.solana.publicKey.toString())
    const sender_account = new PublicKey(sender_address);
    const receiver_account = new PublicKey(rkey);
    console.log("vault:", vault)
    console.log("vault.secryKey:", vault.secretKey)
    console.log("type of vault:", typeof vault)
    console.log("vault publickey:", vault.publicKey.toBase58())
    console.log("receiver_account:", receiver_account)
    var escrow_account = null;
    var token_escrow = null;

    // Storing PDA to the browser's local storage
    const valutObj = {
      vault_publickey: vault.publicKey.toBase58(),
      vault_secretkey: vault.secretKey
    };
    const myVault = JSON.stringify(valutObj);
    // console.log("myVault:", myVault)
    localStorage.setItem("vaultData", myVault);

    // // Retrieving Data from the browser's local storage
    // const text = localStorage.getItem("vaultData");
    // const obj = JSON.parse(text);
    // console.log("obj:", obj)
    // console.log("vault_publickey:", obj.vault_publickey)
    // console.log('vault.secretKey(receive):', obj.vault_secretkey)

    // // Iterating through dictionary-like js object
    // var seed_list = []
    // for (const k of Object.values(obj.vault_secretkey)){
    //   // console.log(k)
    //   seed_list.push(k)
    // }
    // console.log(seed_list)
    // const vault_seed = Uint8Array.from(seed_list)
    // const vault_keypair = Keypair.fromSecretKey(vault_seed)
    // console.log("vault_keypair:", vault_keypair)
    
    const [_escrow_account, _bump] = await PublicKey.findProgramAddress([
      Buffer.from(anchor.utils.bytes.utf8.encode(ESCROW_PDA_SEED)), 
      sender_account.toBuffer()
    ],
    program.programId);
  
    const [_token_escrow_account, _token_bump] = await PublicKey.findProgramAddress([
      Buffer.from(anchor.utils.bytes.utf8.encode(TOKEN_ESCROW_PDA_SEED)), 
      sender_account.toBuffer()
    ],
    program.programId);

    escrow_account = _escrow_account;     // pda to store info about native sol
    token_escrow = _token_escrow_account;  // pda to store info about tokens
    console.log("escrow_account pubkey:", escrow_account.publicKey.toBase58())
    console.log("token_escrow:", token_escrow)

    console.log("systemProgram:", SystemProgram.programId)
    console.log("receiver_account:", receiver_account)
    console.log("vault:", vault.publicKey)
    console.log("sender_account:", sender_account)

    // These info's are associated with my Phantom's Wallet 2
    seed = Uint8Array.from([234,213,96,136,124,249,130,101,245,195,125,75,212,81,23,86,57,128,3,226,133,171,65,198,38,28,74,250,148,240,36,24,13,146,38,110,234,163,131,127,98,18,6,100,103,188,69,138,42,228,138,170,182,200,54,223,243,146,218,106,35,2,21,143]);
    sender_keypair = Keypair.fromSecretKey(seed)
    console.log("Signer Keypair:", sender_keypair)

    /* interact with the program via rpc */
    await program.rpc.initializeNativeSol(
      new anchor.BN(start_time),
      new anchor.BN(amount),
      {
      accounts: {
        escrowAccount: escrow_account,
        senderAccount: sender_account,
        systemProgram: SystemProgram.programId,
        receiverAccount: receiver_account,
        vault: vault.publicKey
        },
      signers: [sender_keypair]
      }
    );
}

async function withdrawNativeToken() {
  /* create a provider that will establish a connection to the solana network */
  const provider = await getProvider();

  /* create the program interface combining the idl, program ID, and provider */
  const program = new Program(idl, programID, provider);
  console.log("programme:", program)

  const sender_address = "uyZFLgTNT2j6enw7wUKbawBJdB7Hj5tqVMUxN6TgV9x";
  console.log("Logged in wallet address:", window.solana.publicKey.toString())
  const sender_account = new PublicKey(sender_address);

  const amount = (sol_amount * LAMPORTS_PER_SOL).toString();
  console.log("amount:", amount)
  const ESCROW_PDA_SEED = "escrow_seed";
  var escrow_account = null;
  const [_escrow_account, _bump] = await PublicKey.findProgramAddress([
    Buffer.from(anchor.utils.bytes.utf8.encode(ESCROW_PDA_SEED)), 
    sender_account.toBuffer()
  ],
  program.programId);
  escrow_account = _escrow_account;
  console.log("escrow_account pubkey:", escrow_account.toBase58())
  
  const receiver_account = new PublicKey(rkey);

  // Retrieving Data from the browser's local storage
  const text = localStorage.getItem("vaultData");
  const obj = JSON.parse(text);
  console.log("obj:", obj)
  console.log("vault_publickey:", obj.vault_publickey)
  console.log('vault.secretKey(receive):', obj.vault_secretkey)

  // Iterating through dictionary-like js object
  var seed_list = []
  for (const k of Object.values(obj.vault_secretkey)){
    // console.log(k)
    seed_list.push(k)
  }
  console.log(seed_list)
  const vault_seed = Uint8Array.from(seed_list)
  const vault_keypair = Keypair.fromSecretKey(vault_seed)
  console.log("vault_keypair:", vault_keypair)

  /* interact with the program via rpc */
  await program.rpc.withdrawNativeSol(
    new anchor.BN(amount),
    {
    accounts: {
      escrowAccount: escrow_account,
      senderAccount: sender_account,
      systemProgram: SystemProgram.programId,
      receiverAccount: receiver_account,
      vault: new PublicKey(obj.vault_publickey)
      },
    signers: [vault_keypair]
    }
  );
}

async function transferSPLToken() {
  /* create a provider that will establish a connection to the solana network */
  const provider = await getProvider();

  /* create the program interface combining the idl, program ID, and provider */
  const program = new Program(idl, programID, provider);
  console.log("programme:", program)

  const amount = (sol_amount * LAMPORTS_PER_SOL).toString();
  console.log("amount:", amount)

  // These info's are associated with my Wallet 4 escrow
  seed = Uint8Array.from([12,19,55,150,170,193,110,212,54,210,94,198,104,113,139,8,232,140,140,99,67,112,126,103,73,4,100,226,93,149,206,19,190,194,240,225,99,17,113,72,89,154,70,103,181,68,149,140,49,86,19,116,43,215,237,246,246,18,91,94,182,109,250,10]);
  sender_keypair = Keypair.fromSecretKey(seed)
  console.log("Sender Keypair:", sender_keypair)
  console.log("sender address:", window.solana.publicKey.toString())
  console.log("sender address(keypair):", sender_keypair.publicKey.toBase58())

  const sender_account = new PublicKey(window.solana.publicKey.toString());

  console.log("tokenmint:", tokenmint)

  var token_escrow = null;
  const start_time = Math.floor(Date.now()/1000);
  console.log("start_time:", start_time)
  const receiver_account = new PublicKey(rkey);
  const vault = anchor.web3.Keypair.generate();
  const vault_ata = getAssociatedTokenAddress(tokenmint, vault.publicKey, false);
  // console.log("mint key", mint.toBase58());
  console.log("vault pubkey:", vault.publicKey.toBase58())

  // Storing PDA to the browser's local storage
  const valutObj = {
    vault_publickey: vault.publicKey.toBase58(),
    vault_secretkey: vault.secretKey
  };
  const myVault = JSON.stringify(valutObj);
  // console.log("myVault:", myVault)
  localStorage.setItem("vaultData", myVault);

  const [_token_escrow_account, _token_bump] = await PublicKey.findProgramAddress([
    Buffer.from(anchor.utils.bytes.utf8.encode(TOKEN_ESCROW_PDA_SEED)), 
    sender_account.toBuffer()
  ],
  program.programId);
  token_escrow = _token_escrow_account;

  const sender_ata = await getOrCreateAssociatedTokenAccount(
    provider.connection,
    sender_keypair,
    tokenmint,
    sender_keypair.publicKey
  );
  console.log("sender ATA", sender_ata.address.toBase58());

  // var sender_ata_token = await provider.connection.getTokenAccountBalance(sender_ata.address);
  // console.log("Total minted token to sender ATA : ", Number(sender_ata_token.value.amount));
  
  // These info's are associated with my Phantom's Wallet 2
  // const private_key = "5hKEG8toa57P13JDDzvQbcLmXyEkXvdb76PPi8K4DHGcGheRzMB1a2tskeKJwfVioipVWi1ZxiE3dZt5Q7aABiza";
  // seed = Uint8Array.from([234,213,96,136,124,249,130,101,245,195,125,75,212,81,23,86,57,128,3,226,133,171,65,198,38,28,74,250,148,240,36,24,13,146,38,110,234,163,131,127,98,18,6,100,103,188,69,138,42,228,138,170,182,200,54,223,243,146,218,106,35,2,21,143]);
  // sender_keypair = Keypair.fromSecretKey(seed)
  // console.log("Signer Keypair:", sender_keypair)

  await program.rpc.intializeFungibleToken(
    new anchor.BN(start_time),
    new anchor.BN(amount),
    {
    accounts:{
      escrowAccount: token_escrow,
      senderAssociatedInfo: sender_ata.address,
      vaultAssociatedInfo: (await vault_ata).toBase58(),
      senderAccount: sender_keypair.publicKey,
      vault: vault.publicKey,
      receiverAccount: receiver_account,
      mint:tokenmint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      associatedTokenProgram:SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    signers: [sender_keypair]
    }
  );
}

async function withdrawSPLToken() {
  /* create a provider that will establish a connection to the solana network */
  const provider = await getProvider();

  /* create the program interface combining the idl, program ID, and provider */
  const program = new Program(idl, programID, provider);
  console.log("programme:", program)

  // These info's are associated with my Wallet 3
  seed = Uint8Array.from([50,192,253,237,154,150,29,170,251,216,155,132,232,48,253,198,223,206,79,105,116,135,27,93,46,59,119,0,121,124,148,17,42,62,249,54,229,198,108,202,162,174,6,134,206,244,187,37,196,80,8,250,223,107,162,213,127,30,116,210,164,244,152,196]);
  receiver_keypair = Keypair.fromSecretKey(seed)
  console.log("Receiver Keypair:", receiver_keypair)
  console.log("Receiver PublicKey:", receiver_keypair.publicKey.toBase58())

  // These info's are associated with my SPL-Wallet-1
  seed = Uint8Array.from([12,19,55,150,170,193,110,212,54,210,94,198,104,113,139,8,232,140,140,99,67,112,126,103,73,4,100,226,93,149,206,19,190,194,240,225,99,17,113,72,89,154,70,103,181,68,149,140,49,86,19,116,43,215,237,246,246,18,91,94,182,109,250,10]);
  sender_keypair = Keypair.fromSecretKey(seed)
  console.log("Signer Keypair:", sender_keypair)

  const amount = (sol_amount * LAMPORTS_PER_SOL).toString();
  console.log("amount:", amount)
  console.log("sender address:", sender_keypair.publicKey.toBase58())
  const sender_account = sender_keypair.publicKey;
  console.log("sender_account:", sender_account)

  var token_escrow = null;
  const [_token_escrow_account, _token_bump] = await PublicKey.findProgramAddress([
    Buffer.from(anchor.utils.bytes.utf8.encode(TOKEN_ESCROW_PDA_SEED)), 
    sender_account.toBuffer()
  ],
  program.programId);
  token_escrow = _token_escrow_account;  

  // Retrieving Data from the browser's local storage
  const text = localStorage.getItem("vaultData");
  const obj = JSON.parse(text);
  console.log("obj:", obj)
  console.log("vault_publickey:", obj.vault_publickey)
  console.log('vault.secretKey(receive):', obj.vault_secretkey)

  // Iterating through dictionary-like js object
  var seed_list = []
  for (const k of Object.values(obj.vault_secretkey)){
    // console.log(k)
    seed_list.push(k)
  }
  console.log(seed_list)
  const vault_seed = Uint8Array.from(seed_list)
  const vault_keypair = Keypair.fromSecretKey(vault_seed)
  console.log("vault_keypair:", vault_keypair)

  const vault_ata = getAssociatedTokenAddress(tokenmint, vault_keypair.publicKey, false);

  const receiver_account = new PublicKey(rkey);
  const receiver_ata = getAssociatedTokenAddress(tokenmint, receiver_account, false);

  await program.rpc.withdrawFungibleToken(
    new anchor.BN(amount),
    {
    accounts:{
      escrowAccount: token_escrow,
      receiverAssociatedInfo: (await receiver_ata).toBase58(),
      vaultAssociatedInfo: (await vault_ata).toBase58(),
      senderAccount: sender_keypair.publicKey,
      vault: vault_keypair.publicKey,
      receiverAccount: receiver_account,
      mint:tokenmint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      associatedTokenProgram:SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
    signers: [receiver_keypair, vault_keypair]
    }
  );
  
}

const handleSubmit = async (event) => {
  //Prevent page reload
  event.preventDefault();

  // Capture Unix-Timestamp
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  console.log('Unix TimeStamp:', timestamp)
  
  if (transactionMode == 0){            // Send SOL
    console.log('Transaction Mode 0')
    transferNativeToken()
  } else if (transactionMode == 1){     // Withdraw SOL
    console.log('Transaction Mode 1')
    withdrawNativeToken()
  } else if (transactionMode == 2){     // Send SPL
    console.log('Transaction Mode 2')
    transferSPLToken()
  } else {                              // Withdraw SPL
    console.log('Transaction Mode 3')
    withdrawSPLToken()
  }
  };

// JSX code for login form
const renderForm = (
  <div className="form">
    {/* <div className="button-container">
        <input type="button"  value='Connect Wallet' onClick={ConnectWallet}/>
    </div> */}

      {/* <h1>
      {connectWallet}
      </h1> */}

    <form onSubmit={handleSubmit}>
      <div className="input-container">
        <label>Receiver-key </label>
        <input type="text" value={rkey} onChange={(e) => setRkey(e.target.value)} required />
      </div>

      <div className="input-container">
        <label>Amount ($) </label>
        <input type="text" value={sol_amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      
      <div onChange={handleChange}>
        <input type="radio" value = {0}  name='transaction' /> Transfer SOL Token
        <input type="radio" value = {1}  name='transaction' /> Withdraw SOL Token<br></br>
        <input type="radio" value = {2}  name='transaction' /> Transfer SPL Token
        <input type="radio" value = {3}  name='transaction' /> Withdraw SPL Token
      </div>

      <div className="button-container">
        <input type="submit"  value='Send'/>
      </div>

      <h1>
      {transactionMode}
      </h1>
    </form>
  </div>
);

// ADDED THIS CODE SNIPPET
if (!wallet.connected) {
  /* If the user's wallet is not connected, display connect wallet button. */
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop:'100px' }}>
      <WalletMultiButton />
    </div>
  )
} else {
  return (
    <div className="App">
      <div className="login-form">
        <div className="title">Zebec Protocol</div>
        {isSubmitted ? <div>User is successfully logged in</div> : renderForm}
      </div>
    </div>
  );
}
}

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
const AppWithProvider = () => (
// <ConnectionProvider endpoint="http://127.0.0.1:8899">
<ConnectionProvider endpoint={network}>
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      <App />
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
)

export default AppWithProvider;


