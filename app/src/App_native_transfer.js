import React, { useState } from "react";
// import ReactDOM from "react-dom";
import {Keypair, TransactionInstruction, PublicKey, Transaction, Connection, clusterApiUrl, SystemProgram } from "@solana/web3.js";
import "./styles.css";
import { extendBorsh } from "./utils/borsh";
import { Buffer } from "buffer";
// const { extendBorsh } = require("./utils/borsh");
import * as bs58 from "bs58";
const { SendSolSchema, SendSol, WithdrawSolSchema, WithdrawSol } = require("./schema");
const { serialize } = require("borsh");
extendBorsh();

// window.Buffer = Buffer;
window.Buffer = window.Buffer || require("buffer").Buffer;

// const pda = new Keypair();
// console.log("pda_1", pda_1)
// const pda = "Ddbd4ZSoQb7AaNZwBW1c42uWpyFaSizn9RCTxvr2VXqF"
// const pda_address = pda.publicKey.toString();

// PDA generated from seed
// const senderaddress = new PublicKey(window.solana.publicKey.toString());
// const receiver_address = "3qupQgH5RaigtFNV7acr7Y9xvcc91F71VCf1szPH1Xej"
// const pdaAddress = await PublicKey.findProgramAddress(
//   [senderaddress.toBuffer()],
//   receiver_address
// );
// console.log("PDA ADDRESS", pdaAddress[0].toBase58())

function App() {
  // React States
  // const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [transactionMode, setTransactionMode]   = useState('Trans: Not selected');
  const [connectWallet, setConnectWallet] = useState('Not Connected');

  const [rkey, setRkey] = useState('');
  const [amount, setAmount] = useState('');

  // const PROGRAM_ID = "ACebcF5WjNbotDSPQjZPrRGVi8jPX4MYquePcBU2E1F1";  // program_id of the deployed program
  // const PROGRAM_ID = "2Xf6dAxq5AAhw7NqtJLsyCvwAGoMG911e2CproonqTk1";  // deployed on LocalNet
  const PROGRAM_ID = "8EBQJdgAdFiSu56Nh1PfE3JKbEJ9s4ez1auDvjvCyosB";  // program_id of the deployed program
  // const pda_address_new = "Ddbd4ZSoQb7AaNZwBW1c42uWpyFaSizn9RCTxvr2VXqF"
  const senderaddress = "uyZFLgTNT2j6enw7wUKbawBJdB7Hj5tqVMUxN6TgV9x"; //my wallet-2
  // const senderaddress = "enter_the_address_of_sender's_wallet";

  // const pda = new Keypair();
  // const pda_address = pda.publicKey.toString();
  // console.log('PDA Address:', pda_address)

  const base58publicKey = new PublicKey(
    "8EBQJdgAdFiSu56Nh1PfE3JKbEJ9s4ez1auDvjvCyosB"
  );
  // const stringofwithdraw = "withdraw_sol";

  const handleChange = e => {
    // this.setState({radio_value:e.target.value})
    // alert("Selected radio value is :"+e.target.value)
    // console.log(e.target.value)
    setTransactionMode(e.target.value)
  };

  // Connecting to the DevNet
  const connection = new Connection(clusterApiUrl("devnet"));

  // Connecting to the LocalNet
  // const opts = {
  //   preflightCommitment: "processed"
  // }
  // const network = "http://127.0.0.1:8899";
  // const connection = new Connection(network, opts.preflightCommitment);

  // const cluster = "devnet";

  async function ConnectWallet(e){
    // console.log(e.target.value)
    try {
      // const resp = await window.solana.connect();
      // console.log(resp.publicKey.toString())

      await window.solana.connect();
      window.solana.connect({ onlyIfTrusted: true });  // eagarly connection
      console.log(window.solana.publicKey.toString())
      // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo 
    } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
    }
    setConnectWallet('Connected')
  }

  async function transferTransaction(formSubmit) {

    const pda = new Keypair();
    console.log('pda keypair', pda)
    console.log('pda publicKey', pda.publicKey)
    console.log('pda_address(send)', pda.publicKey.toBase58())

    // Storing PDA to the browser's local storage
    const pdaObj = {
      pda : pda,
      pda_address : pda.publicKey.toBase58()
    };
    const myJson = JSON.stringify(pdaObj);
    localStorage.setItem("pdaData", myJson);

    // Retrieving Data from the browser's local storage
    const text = localStorage.getItem("pdaData");
    const obj = JSON.parse(text);
    console.log('obj.pda:', obj.pda)
    console.log('obj.pda_address:', obj.pda_address)

    // const pda_keypair = Keypair.fromSecretKey(
    //   bs58.decode("5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG")
    // );
    // const pda_keypair_address = pda_keypair.publicKey.toBase58();
    // console.log('pda_keypair:', pda_keypair)
    // console.log('pda_keypair_address:', pda_keypair_address)

    const vaultAddress_pub = await PublicKey.findProgramAddress(
      [new PublicKey(senderaddress).toBuffer()],
      base58publicKey
    );
    const vaultAddress = vaultAddress_pub[0].toBase58();
    console.log('SenderAddress', senderaddress)
    console.log('SenderAddress_pub', new PublicKey(senderaddress))
    console.log('vaultAddress_pub', vaultAddress_pub)
    console.log('vaultAddress_pub[0]', vaultAddress_pub[0])
    console.log('vaultAddress', vaultAddress)

    // console.log('PDA pubkey', pda.publicKey.toString())
    console.log('RKEY', rkey)
    
    // create keypairs
    // let KEYPAIRS = web3.Keypair.fromSeed(pdaAddress);
    // console.log("KEYPAIRS", KEYPAIRS)
    // const keypair = Keypair.fromSecretKey(
    //   bs58.decode("5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG")
    // );

    const instruction = new TransactionInstruction({
      keys: [
        {
          // pubkey: pda_keypair.publicKey,  // escrow
          pubkey: pda.publicKey,  // escrow
          isSigner: true,
          isWritable: true,
        },
        {
          // pubkey: new PublicKey(window.solana.publicKey.toString()),  //sender
          pubkey: new PublicKey(senderaddress),  //sender
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(rkey), //recipient
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId, //system program required to make a transfer
          isSigner: false,
          isWritable: false,
        },
        {
          // pubkey: vaultAddress, //vault
          pubkey: vaultAddress_pub[0], //vault
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: new PublicKey(PROGRAM_ID),
      data: serialize(SendSolSchema,new SendSol(formSubmit)),
    });

    console.log('instruction',instruction);
    const transaction = new Transaction().add(instruction);

      // try {
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;
        transaction.feePayer = window.solana.publicKey;
        transaction.partialSign(pda);
        // transaction.partialSign(pda_keypair);
        console.log('transaction:', transaction)
        const signed = await window.solana.signTransaction(transaction);
        console.log('signed:', signed)
        const signature = await connection.sendRawTransaction(signed.serialize());
        console.log('signature:', signature)
        const finality = "confirmed";
        await connection.confirmTransaction(signature, finality);
        const explorerhash = {
          transactionhash: signature,
        };

        console.log('Explorerhash:', explorerhash);
  }

  async function withdrawTransaction(formSubmit) {
    // const senderaddress = new PublicKey(window.solana.publicKey.toString());
    // const senderaddress = new PublicKey("uyZFLgTNT2j6enw7wUKbawBJdB7Hj5tqVMUxN6TgV9x");
    // const receiver_address = new PublicKey("3qupQgH5RaigtFNV7acr7Y9xvcc91F71VCf1szPH1Xej");
    // const pdaAddress = await PublicKey.findProgramAddress(
    //   [senderaddress],
    //   receiver_address
    // );
    
    // Retrieving Data from the browser's local storage
    const text = localStorage.getItem("pdaData");
    const obj = JSON.parse(text);
    console.log('obj.pda:', obj.pda)
    console.log('obj.pda_address:', obj.pda_address)

    const vaultAddress_pub = await PublicKey.findProgramAddress(
      [new PublicKey(senderaddress).toBuffer()],
      base58publicKey
    );
    const vaultAddress = vaultAddress_pub[0].toBase58();

    // console.log('pda_address(receive)', pda_address)
    console.log('SenderAddress', senderaddress)
    console.log('vaultAddress_pub', vaultAddress_pub)
    console.log('vaultAddress', vaultAddress)
    console.log('RKEY', rkey)

    // const withdraw_data = await PublicKey.findProgramAddress(
    //   [Buffer.from(stringofwithdraw),new PublicKey(senderaddress).toBuffer()],
    //   base58publicKey
    // );

    const instruction = new TransactionInstruction({
      keys: [
        {
          // pubkey: new PublicKey(pda_address),  // escrow
          pubkey: new PublicKey(obj.pda_address),
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(senderaddress),  //sender
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: new PublicKey(rkey), //recipient
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId, //system program required to make a transfer
          isSigner: false,
          isWritable: false,
        },
        {
          // pubkey: vaultAddress, //vault
          pubkey: vaultAddress_pub[0], //vault
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: new PublicKey(PROGRAM_ID),
      data: serialize(WithdrawSolSchema,new WithdrawSol(formSubmit)),
    });

    console.log('instruction',instruction);
    const transaction = new Transaction().add(instruction);

      // try {
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;
        transaction.feePayer = window.solana.publicKey;
        // transaction.partialSign(pda);
        // console.log('transaction:', transaction)
        const signed = await window.solana.signTransaction(transaction);
        console.log('signed:', signed)
        const signature = await connection.sendRawTransaction(signed.serialize());
        console.log('signature:', signature)
        const finality = "confirmed";
        await connection.confirmTransaction(signature, finality);
        const explorerhash = {
          transactionhash: signature,
        };

        console.log('Explorerhash:', explorerhash);
  }

  const handleSubmit = async (event) => {
    //Prevent page reload
    event.preventDefault();

    // Capture Unix-Timestamp
    const dateTime = Date.now();
    const timestamp = Math.floor(dateTime / 1000);
    console.log('Unix TimeStamp:', timestamp)


    // const formSubmit = { transactionMode, timestamp, rkey, amount };
    // console.log('rkey', rkey)
    
    if (transactionMode == 0){ // Send
      console.log('Transaction Mode 0')
      const formSubmit = { transactionMode, timestamp, amount };
      transferTransaction(formSubmit)
    } else {                  // Withdraw
      console.log('Transaction Mode 1')
      const formSubmit = { transactionMode, amount };
      withdrawTransaction(formSubmit)
    }
    // console.log('formSubmit', formSubmit)

    // const senderaddress = new PublicKey(window.solana.publicKey.toString());
    // const pda = new Keypair();
    // console.log('SenderAddress', senderaddress)
    // console.log('PDA', pda)

    // const instruction = new TransactionInstruction({
    //   keys: [
    //     {
    //       pubkey: pda.publicKey,  // escrow
    //       isSigner: true,
    //       isWritable: true,
    //     },
    //     {
    //       pubkey: new PublicKey(window.solana.publicKey.toString()),  //sender
    //       isSigner: true,
    //       isWritable: true,
    //     },
    //     {
    //       pubkey: new PublicKey(rkey), //recipient
    //       isSigner: false,
    //       isWritable: true,
    //     },
    //     {
    //       pubkey: SystemProgram.programId, //system program required to make a transfer
    //       isSigner: false,
    //       isWritable: false,
    //     },
    //   ],
    //   programId: new PublicKey(PROGRAM_ID),
    //   data: serialize(SendSolSchema,new SendSol(formSubmit_1)),      
      
    // });

    // console.log('instruction',instruction);
    // const transaction = new Transaction().add(instruction);

    //   // try {
    //     transaction.recentBlockhash = (
    //       await connection.getLatestBlockhash()
    //     ).blockhash;
    //     transaction.feePayer = window.solana.publicKey;
    //     transaction.partialSign(pda);
    //     console.log('transaction:', transaction)
    //     const signed = await window.solana.signTransaction(transaction);
    //     console.log('signed:', signed)
    //     const signature = await connection.sendRawTransaction(signed.serialize());
    //     console.log('signature:', signature)
    //     const finality = "confirmed";
    //     await connection.confirmTransaction(signature, finality);
    //     const explorerhash = {
    //       transactionhash: signature,
    //     };

        // console.log('Explorerhash:', explorerhash);
    // } catch (e) {
    //   console.warn(e);
    //   return {
    //     transactionhash: null,
    //   };
    // }
      };


  // JSX code for login form
  const renderForm = (
    <div className="form">
      <div className="button-container">
          <input type="button"  value='Connect Wallet' onClick={ConnectWallet}/>
      </div>

        <h1>
        {connectWallet}
        </h1>

      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label>Receiver-key </label>
          <input type="text" value={rkey} onChange={(e) => setRkey(e.target.value)} required />
        </div>

        <div className="input-container">
          <label>Amount ($) </label>
          <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} required />
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

  return (
    <div className="app">
      <div className="login-form">
        <div className="title">Zebec Protocal</div>
        {isSubmitted ? <div>User is successfully logged in</div> : renderForm}
      </div>
    </div>
  );
}

export default App;