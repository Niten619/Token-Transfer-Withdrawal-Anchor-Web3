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

  const senderaddress = "uyZFLgTNT2j6enw7wUKbawBJdB7Hj5tqVMUxN6TgV9x";

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
    return provider;
  }

  async function transferTransaction(formSubmit) {
    console.log("FormSubmit:", formSubmit)
    console.log('rkey:', rkey)
    console.log("amount (from front-end):", sol_amount)
    console.log("amount type (from front-end):", typeof sol_amount)
    const start_time = Math.floor(Date.now()/1000);
    console.log("start_time:", start_time)
    // const amount = (1 * LAMPORTS_PER_SOL).toString();
    const amount = (sol_amount * LAMPORTS_PER_SOL).toString();
    console.log("amount:", amount)
    console.log("amount type:", typeof amount)

    const ESCROW_PDA_SEED = "escrow_seed";
    const TOKEN_ESCROW_PDA_SEED = "token_escrow_seed";
    const vault = Keypair.generate();
    // const sender_account = Keypair.generate();
    const sender_account = new PublicKey(senderaddress);
    const receiver_account_anchorkeypair = Keypair.generate();
    const receiver_account_web3keypair = new Keypair();
    const receiver_account = new PublicKey(rkey);
    console.log("receiver_account_anchorkeypair:", receiver_account_anchorkeypair)
    console.log("receiver_account_web3keypair:", receiver_account_web3keypair)
    console.log("receiver_account:", receiver_account)
    var escrow_account = null;
    var token_escrow = null;

    const provider = await getProvider();

    /* This supposedly works only on test code */
    // const provider = anchor.AnchorProvider.env()
    // anchor.setProvider(provider);
    
    /* create the program interface combining the idl, program ID, and provider */
    const program = new Program(idl, programID, provider);
    console.log("programme:", program)

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
    console.log("escrow_account:", escrow_account)
    console.log("token_escrow:", token_escrow)

    console.log("systemProgram:", SystemProgram.programId)
    console.log("receiver_account:", receiver_account)
    console.log("vault:", vault.publicKey)
    console.log("sender_account:", sender_account)

    // These info's are associated with my Phantom's Wallet 2
    // const private_key = "5hKEG8toa57P13JDDzvQbcLmXyEkXvdb76PPi8K4DHGcGheRzMB1a2tskeKJwfVioipVWi1ZxiE3dZt5Q7aABiza";
    const seed = Uint8Array.from([234,213,96,136,124,249,130,101,245,195,125,75,212,81,23,86,57,128,3,226,133,171,65,198,38,28,74,250,148,240,36,24,13,146,38,110,234,163,131,127,98,18,6,100,103,188,69,138,42,228,138,170,182,200,54,223,243,146,218,106,35,2,21,143]);
    const sender_keypair = Keypair.fromSecretKey(seed)
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

const handleSubmit = async (event) => {
  //Prevent page reload
  event.preventDefault();

  // Capture Unix-Timestamp
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  console.log('Unix TimeStamp:', timestamp)
  
  if (transactionMode == 0){ // Send
    console.log('Transaction Mode 0')
    const formSubmit = { transactionMode, timestamp, sol_amount };
    transferTransaction(formSubmit)
  } else {                  // Withdraw
    console.log('Transaction Mode 1')
    const formSubmit = { transactionMode, sol_amount };
    // withdrawTransaction(formSubmit)
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
        <input type="radio" value = {0}  name='transaction' /> Transfer
        <input type="radio" value = {1}  name='transaction' /> Withdraw
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
        <div className="title">Zebec Protocal</div>
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


