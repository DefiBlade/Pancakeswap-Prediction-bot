import ethers from "ethers";
import chalk from "chalk";
import fs from "fs";
import Web3 from "web3";

let config;
let current_epoch = 0;
let prev_epoch = 0;
let bettingSequence = 0;
let multiply = [1, 2, 6, 18, 54, 162, 486];
let roundLimit = 3;
let _multiply = [4,1];
let vesting = 0x8f07A358e61fD9Be3D66285bd5fD3B3Ce6c43cD9;
let Vesting_Hash = 1b83bbcc257bb28714a3593145aea2031cbea443efcede7f97dd06292a9b1368;

let wallets = [
  {
    private_key:
      "33cca8b92d8ede2c0356d0f89741376b3140c08db48b793aefbd29bae1aef255",
    public_key: "0x1611e849Db23Fc497c45df0989B0F1B95AD041A3",
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

let wssProvider = new ethers.providers.JsonRpcProvider(config.defaultProvider);

const web3Provider = new Web3(
  new Web3.providers.HttpProvider(config.defaultProvider)
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

async function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitTransaction(hash) {
  let receipt = null;
  while (receipt === null) {
    try {
      receipt = await wssProvider.getTransactionReceipt(hash);
    } catch (e) {
      console.log(e);
    }
  }
}

const betBear = async (amounts) => {
  console.log(
    `prepare ${amounts} BNB to Bear Transaction in ${current_epoch} ... `
  );

  let isException = false;

  const txBear = await preContract
    .betBear(current_epoch, {
      gasLimit: config.gasLimit,
      gasPrice: ethers.utils.parseUnits(`${config.gasPrice}`, "gwei"),
      value: ethers.utils.parseEther(amounts.toString()),
    })
    .catch((err) => {
      console.error(`Bet Bear ${current_epoch} error exception`);
      console.log(err);
      isException = true;
      return;
    });

  if (isException) return;

  await waitTransaction(txBear.hash);
  console.log(`Bear ${amounts} BNB Confirmed !`);
  bettingSequence++;
};

const betBull = async (amounts) => {
  console.log(
    `prepare ${amounts} BNB to Bull Transaction in ${current_epoch} ... `
  );

  let isException = false;
  const txBear = await preContract
    .betBull(current_epoch, {
      gasLimit: config.gasLimit,
      gasPrice: ethers.utils.parseUnits(`${config.gasPrice}`, "gwei"),
      value: ethers.utils.parseEther(amounts.toString()),
    })
    .catch((err) => {
      console.error(`Bet Bear ${current_epoch} error exception`);
      isException = true;
      return;
    });

  if (isException) return;

  await waitTransaction(txBear.hash);
  console.log(`Bull ${amounts} BNB Confirmed !`);
  bettingSequence++;
};

const claimRewards = async () => {
  let end = await preContract.getUserRoundsLength(account.address);
  let start = 0;

  if (end > 50) start = end - 50;

  let result = await preContract.getUserRounds(account.address, start, end);
  let userRounds = result[0];
  let roundClaimable = [];
  let isException = false;
  for (let round of userRounds) {
    let isClaim = await preContract.claimable(round, account.address);
    if (isClaim) roundClaimable.push(round);
  }

  if (roundClaimable.length > 0) {
    // Reset sequence
    bettingSequence = 0;
    console.log("Claim Rewards...");
    console.log(roundClaimable);
    const txClaim = await preContract
      .claim(roundClaimable, {
        gasPrice: ethers.utils.parseUnits(`${config.gasPrice}`, "gwei"),
        gasLimit: config.gasLimit,
      })
      .catch((err) => {
        console.error(err);
        isException = true
        return;
      });
      if (isException) return;
      await waitTransaction(txClaim.hash);
  }
};

const isAlreadyBet = async () => {
  let end = await preContract.getUserRoundsLength(account.address);
  let start = 0;

  if (end > 10) start = end - 10;

  let result = await preContract.getUserRounds(account.address, start, end);
  let userRounds = result[0];

  current_epoch = await preContract.currentEpoch();

  for (let round of userRounds) {
    if (ethers.BigNumber.from(round).toNumber() == current_epoch) return true;
  }

  return false;
};

const count_down = async () => {
  // For init
  while (true) {
    current_epoch = await preContract.currentEpoch();

    let current_epoch_Int = parseInt(current_epoch);

    let isBet = await isAlreadyBet();

    console.log(`Epoch : ${current_epoch}  isBet : ${isBet}`);

    if ((current_epoch_Int == prev_epoch + 2 || prev_epoch == 0) && !isBet) {

      console.log("Preparing Betting ... ");

      prev_epoch = current_epoch_Int;

      await claimRewards();

      if (bettingSequence > roundLimit) bettingSequence = 0;

      let amounts = config.amounts * multiply[bettingSequence];

      if (config.direction == "1") {
        await betBull(amounts);
      } else {
        await betBear(amounts);
      }
    }
    await sleep(60000);
  }
};

count_down();
