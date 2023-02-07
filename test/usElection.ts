import { USElection__factory } from "./../typechain-types/factories/Election.sol/USElection__factory";
import { USElection } from "./../typechain-types/Election.sol/USElection";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("USElection", function () {
  let usElectionFactory;
  let usElection: USElection;

  before(async () => {
    usElectionFactory = await ethers.getContractFactory("USElection");

    usElection = await usElectionFactory.deploy();

    await usElection.deployed();
  });

  it("Should return the current leader before submit any election results", async function () {
    expect(await usElection.currentLeader()).to.equal(0); // NOBODY
  });

  it("Should return the election status", async function () {
    expect(await usElection.electionEnded()).to.equal(false); // Not Ended
  });

  it("Should submit state results and get current leader", async function () {
    const stateResults = ["California", 1000, 900, 32];

    const submitStateResultsTx = await usElection.submitStateResult(
      stateResults
    );

    await submitStateResultsTx.wait();

    expect(await usElection.currentLeader()).to.equal(1); // BIDEN
  });

  it("Should throw when try to submit already submitted state results", async function () {
    const stateResults = ["California", 1000, 900, 32];

    expect(usElection.submitStateResult(stateResults)).to.be.revertedWith(
      "This state result was already submitted!"
    );
  });

  it("Should submit state results and get current leader", async function () {
    const stateResults = ["Ohaio", 800, 1200, 33];

    const submitStateResultsTx = await usElection.submitStateResult(
      stateResults
    );

    await submitStateResultsTx.wait();

    expect(await usElection.currentLeader()).to.equal(2); // TRUMP
  });

  it("Submit state results and throw error stay must have atleast one seat", async function () {
    const stateResults = ["Test", 800, 1200, 0];

    await expect(usElection.submitStateResult(stateResults)).to.be.revertedWith("States must have at least 1 seat");
  });

  it("Submit state results and throw error vote cannot be tie", async function () {
    const stateResults = ["Test", 1200, 1200, 10];

    await expect(usElection.submitStateResult(stateResults)).to.be.revertedWith("There cannot be a tie");
  });

  it("End the elections, should throw error not owner", async function () {
    const [owner, addr1] = await ethers.getSigners();

    await expect(usElection.connect(addr1).endElection()).to.be.revertedWith("Not invoked by the owner");
  });

  it("Should end the elections, get the leader and election status", async function () {
    const endElectionTx = await usElection.endElection();

    await endElectionTx.wait();

    expect(await usElection.currentLeader()).to.equal(2); // TRUMP

    expect(await usElection.electionEnded()).to.equal(true); // Ended
  });

  it("End the elections, should throw error election ended already", async function () {
    await expect(usElection.endElection()).to.be.revertedWith("The election has ended already");
  });

  it("Submit state results with not owner and throw error", async function () {
    const stateResults = ["Ohaio", 800, 1200, 33];
    const [owner, addr1] = await ethers.getSigners();

    await expect(usElection.connect(addr1).submitStateResult(stateResults)).to.be.revertedWith("Not invoked by the owner");
  });

  it("Submit state results and throw error election already ended", async function () {
    const stateResults = ["Test", 800, 1200, 33];

    expect(await usElection.electionEnded()).to.equal(true); // Ended
    await expect(usElection.submitStateResult(stateResults)).to.be.revertedWith("The election has ended already");
  });
});
