import ethers from "ethers";
import chalk from "chalk";
import fs from "fs";
import Web3 from "web3";

let config, gNonce;
let remain_time = 300;
let current_epoch = 0;
let current_round;
let txBear, txBull;
let subscriptionPre;
let onSubscription = false;
let wallets = [
  {
    private_key:
      "",
    public_key: "",
  },
];

try {
  config = JSON.parse(fs.readFileSync("config/config.json", "utf8"));
} catch (error) {
  console.error(error);
}

async function getNonce(addr) {
  const nonce = await wssProvider.getTransactionCount(addr);
  return nonce;
}

let wssProvider = new ethers.providers.WebSocketProvider(config.wssProvider);
const web3Provider = new Web3(
  new Web3.providers.WebsocketProvider(config.wssProvider)
);

let PREDICTION_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_oracleAddress", type: "address" },
      { internalType: "address", name: "_adminAddress", type: "address" },
      { internalType: "address", name: "_operatorAddress", type: "address" },
      { internalType: "uint256", name: "_intervalSeconds", type: "uint256" },
      { internalType: "uint256", name: "_bufferSeconds", type: "uint256" },
      { internalType: "uint256", name: "_minBetAmount", type: "uint256" },
      {
        internalType: "uint256",
        name: "_oracleUpdateAllowance",
        type: "uint256",
      },
      { internalType: "uint256", name: "_treasuryFee", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BetBear",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BetBull",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Claim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      { indexed: false, internalType: "int256", name: "price", type: "int256" },
    ],
    name: "EndRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "roundId",
        type: "uint256",
      },
      { indexed: false, internalType: "int256", name: "price", type: "int256" },
    ],
    name: "LockRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "NewAdminAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "bufferSeconds",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "intervalSeconds",
        type: "uint256",
      },
    ],
    name: "NewBufferAndIntervalSeconds",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minBetAmount",
        type: "uint256",
      },
    ],
    name: "NewMinBetAmount",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "NewOperatorAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "oracle",
        type: "address",
      },
    ],
    name: "NewOracle",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oracleUpdateAllowance",
        type: "uint256",
      },
    ],
    name: "NewOracleUpdateAllowance",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "treasuryFee",
        type: "uint256",
      },
    ],
    name: "NewTreasuryFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
    ],
    name: "Pause",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardBaseCalAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "treasuryAmount",
        type: "uint256",
      },
    ],
    name: "RewardsCalculated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
    ],
    name: "StartRound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokenRecovery",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TreasuryClaim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
    ],
    name: "Unpause",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "MAX_TREASURY_FEE",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "adminAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "epoch", type: "uint256" }],
    name: "betBear",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "epoch", type: "uint256" }],
    name: "betBull",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "bufferSeconds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256[]", name: "epochs", type: "uint256[]" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "epoch", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "claimable",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentEpoch",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "executeRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "genesisLockOnce",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "genesisLockRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "genesisStartOnce",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "genesisStartRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "cursor", type: "uint256" },
      { internalType: "uint256", name: "size", type: "uint256" },
    ],
    name: "getUserRounds",
    outputs: [
      { internalType: "uint256[]", name: "", type: "uint256[]" },
      {
        components: [
          {
            internalType: "enum PancakePredictionV2.Position",
            name: "position",
            type: "uint8",
          },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "bool", name: "claimed", type: "bool" },
        ],
        internalType: "struct PancakePredictionV2.BetInfo[]",
        name: "",
        type: "tuple[]",
      },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserRoundsLength",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "intervalSeconds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "address", name: "", type: "address" },
    ],
    name: "ledger",
    outputs: [
      {
        internalType: "enum PancakePredictionV2.Position",
        name: "position",
        type: "uint8",
      },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bool", name: "claimed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minBetAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "operatorAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracle",
    outputs: [
      {
        internalType: "contract AggregatorV3Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracleLatestRoundId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "oracleUpdateAllowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_token", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "recoverToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "epoch", type: "uint256" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "refundable",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "rounds",
    outputs: [
      { internalType: "uint256", name: "epoch", type: "uint256" },
      { internalType: "uint256", name: "startTimestamp", type: "uint256" },
      { internalType: "uint256", name: "lockTimestamp", type: "uint256" },
      { internalType: "uint256", name: "closeTimestamp", type: "uint256" },
      { internalType: "int256", name: "lockPrice", type: "int256" },
      { internalType: "int256", name: "closePrice", type: "int256" },
      { internalType: "uint256", name: "lockOracleId", type: "uint256" },
      { internalType: "uint256", name: "closeOracleId", type: "uint256" },
      { internalType: "uint256", name: "totalAmount", type: "uint256" },
      { internalType: "uint256", name: "bullAmount", type: "uint256" },
      { internalType: "uint256", name: "bearAmount", type: "uint256" },
      { internalType: "uint256", name: "rewardBaseCalAmount", type: "uint256" },
      { internalType: "uint256", name: "rewardAmount", type: "uint256" },
      { internalType: "bool", name: "oracleCalled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_adminAddress", type: "address" },
    ],
    name: "setAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_bufferSeconds", type: "uint256" },
      { internalType: "uint256", name: "_intervalSeconds", type: "uint256" },
    ],
    name: "setBufferAndIntervalSeconds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_minBetAmount", type: "uint256" },
    ],
    name: "setMinBetAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_operatorAddress", type: "address" },
    ],
    name: "setOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_oracle", type: "address" }],
    name: "setOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_oracleUpdateAllowance",
        type: "uint256",
      },
    ],
    name: "setOracleUpdateAllowance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_treasuryFee", type: "uint256" },
    ],
    name: "setTreasuryFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "treasuryAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "treasuryFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "", type: "address" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "userRounds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

let PREDICTIOn_ADDR = "0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA";
let wallet = new ethers.Wallet(wallets[0].private_key);
const account = wallet.connect(wssProvider);

let preContract = new ethers.Contract(PREDICTIOn_ADDR, PREDICTION_ABI, account);

let preContract3 = new web3Provider.eth.Contract(
  PREDICTION_ABI,
  PREDICTIOn_ADDR
);

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

const prepareBearTx = async () => {
  console.log(`prepare Bear Transaction for ${current_epoch} ... `);

  let tx = {
    from: wallets[0].public_key,
    to: PREDICTIOn_ADDR,
    value: web3Provider.utils.toHex(
      web3Provider.utils.toWei(config.amounts, "ether")
    ),
    data: preContract3.methods.betBear(current_epoch).encodeABI(),
    gasPrice: web3Provider.utils.toHex(
      web3Provider.utils.toWei(config.gasPrice, "gwei")
    ),
    gas: config.gasLimit,
  };

  const signedTx = await web3Provider.eth.accounts.signTransaction(
    tx,
    wallets[0].private_key
  );

  txBear = signedTx.rawTransaction;
};

const prepareBullTx = async () => {
  console.log(`prepare Bull Transaction for ${current_epoch} ... `);

  let tx = {
    from: wallets[0].public_key,
    to: PREDICTIOn_ADDR,
    value: web3Provider.utils.toHex(
      web3Provider.utils.toWei(config.amounts, "ether")
    ),
    data: preContract3.methods.betBull(current_epoch).encodeABI(),
    gasPrice: web3Provider.utils.toHex(
      web3Provider.utils.toWei(config.gasPrice, "gwei")
    ),
    gas: config.gasLimit,
  };

  const signedTx = await web3Provider.eth.accounts.signTransaction(
    tx,
    wallets[0].private_key
  );

  txBull = signedTx.rawTransaction;
};

const count_down = async () => {
  // For init
  current_epoch = await preContract.currentEpoch();
  await prepareBearTx();
  await prepareBullTx();

  while (true) {
    current_epoch = await preContract.currentEpoch();
    current_round = await preContract.rounds(current_epoch);
    remain_time = current_round[2] - Math.round(+new Date() / 1000);
    process.stdout.write("Count Down: " + remain_time + " \r");

    if (remain_time == 30) {
      await prepareBearTx();
      await prepareBullTx();
    } else if (remain_time == 10) {
      subscriptionPre = web3Provider.eth.subscribe(
        "pendingTransactions",
        function (error, result) {}
      );
      run();
      await sleep(10000);
    } else if (remain_time == 260) {
      if (onSubscription) {
        subscriptionPre.unsubscribe(function (error, success) {
          if (success) {
            onSubscription = false;
            console.log("Successfully unsubscribed!");
          }
        });
      }
    }
    await sleep(1000);
  }
};

const getClaimableLen = async () => {
  let result = await preContract.getUserRounds(account.address, 0, 100);
  let userRounds = result[0];
  let roundClaimable = [];
  for (let round of userRounds) {
    let isClaim = await preContract.claimable(round, account.address);
    if (isClaim) roundClaimable.push(round);
  }
  return roundClaimable.length;
};

const claimRewards = async (limit) => {
  let end = await preContract.getUserRoundsLength(account.address);
  let start = 0;

  if (end > 50) start = end - 50;

  let result = await preContract.getUserRounds(account.address, start, end);
  let userRounds = result[0];
  let roundClaimable = [];
  for (let round of userRounds) {
    let isClaim = await preContract.claimable(round, account.address);
    if (isClaim) roundClaimable.push(round);
  }

  if (roundClaimable.length > limit) {
    console.log("Claim Rewards...");
    console.log(roundClaimable);
    const txClaim = await preContract
      .claim(roundClaimable, {
        gasPrice: ethers.utils.parseUnits(`${config.gasPrice}`, "gwei"),
        gasLimit: config.gasLimit,
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  }
};

const run = async () => {
  console.log(chalk.red(`\nListening Start...`));
  onSubscription = true;
  subscriptionPre.on("data", async (tx) => {
    web3Provider.eth.getTransaction(tx).then(async function (transaction) {
      if (
        transaction != null &&
        transaction.from.toLocaleLowerCase() == config.targetAddress
      ) {
        let func = transaction.input.substring(0, 10).toLowerCase();
        if (func == "0xaa6b873a") {
          // bear
          console.log("Detect Bear");
          web3Provider.eth
            .sendSignedTransaction(txBear)
            .once("confirmation", async () => {
              console.log(`${current_epoch} BetBear done !`);
              claimRewards(2);
              subscriptionPre.unsubscribe(function (error, success) {
                if (success) {
                  onSubscription = false;
                  console.log("Successfully unsubscribed!");
                }
              });
            });
        } else if (func == "0x57fb096f") {
          // bull
          console.log("Detect Bull");
          web3Provider.eth
            .sendSignedTransaction(txBull)
            .once("confirmation", async () => {
              console.log(`${current_epoch} BetBull done !`);
              claimRewards(2);
              subscriptionPre.unsubscribe(function (error, success) {
                if (success) {
                  onSubscription = false;
                  console.log("Successfully unsubscribed!");
                }
              });
            });
        } else if (func == "0x6ba4c138") {
          //claim
          // claimRewards(0);
        }
      }
    });
  });
};

count_down();
