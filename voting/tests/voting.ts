import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { BankrunProvider } from "anchor-bankrun";
import { PublicKey } from "@solana/web3.js";
import { startAnchor } from "solana-bankrun";

const IDL = require("../target/idl/voting.json");

const votingAddress = new PublicKey(
  "CNYt6T7vLE4XJGThBGspEFxcyuigezJEB7U7obBMUQ6h"
);

describe("voting", () => {
  let context;
  let provider;
  let votingProgram: Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor(
      "",
      [{ name: "voting", programId: votingAddress }],
      []
    );

    provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(IDL, provider);
  });

  it("Initialize Poll", async () => {
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        "What is your fav type of peanut butterrrr",
        new anchor.BN(1755004704),
        new anchor.BN(1755089304),
        new anchor.BN(0)
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log("poll address", poll);

    expect(poll.pollId.toNumber()).toBe(1);
    expect(poll.description).toBe("What is your fav type of peanut butterrrr");
  });

  it("initialize poll candidate", async () => {
    await votingProgram.methods
      .initializeCandidate("Smooth", new anchor.BN(1))
      .rpc();

    await votingProgram.methods
      .initializeCandidate("Chrunchy", new anchor.BN(1))
      .rpc();

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Chrunchy")],
      votingAddress
    );

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smooth")],
      votingAddress
    );

    const crunchyCandidate = await votingProgram.account.candidate.fetch(
      crunchyAddress
    );

    const smoothCandidate = await votingProgram.account.candidate.fetch(
      smoothAddress
    );

    expect(crunchyCandidate.candidateName).toBe("Chrunchy");
    expect(crunchyCandidate.candidateVotes.toNumber()).toBe(0);

    expect(smoothCandidate.candidateName).toBe("Smooth");
    expect(smoothCandidate.candidateVotes.toNumber()).toBe(0);
  });

  it("vote", async () => {
    await votingProgram.methods.vote("Smooth", new anchor.BN(1)).rpc();

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Smooth")],
      votingAddress
    );

    const smoothCandidate = await votingProgram.account.candidate.fetch(
      smoothAddress
    );

    console.log(smoothCandidate);

    // expect(smoothCandidate.candidateVotes.toNumber()).toBe(1);
  });
});
