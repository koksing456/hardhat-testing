import { expect, assert } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { parse } from "path";

export const shouldDeposit = (): void => {
  //   // to silent warning for duplicate definition of Transfer event
  //   ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);

  context(`#deposit`, async function () {
    //check more than zero modifier
    it(`should revert if the amount is not greater than zero`, async function () {
      const amount = ethers.constants.Zero;

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith(`NeedsMoreThanZero`);
    });

    //check emit Deposit
    it(`should emit proper event -> Deposit event`, async function () {
      const amount: BigNumber = ethers.constants.One;

      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      )
        .to.emit(this.lending, `Deposit`)
        .withArgs(
          this.signers.alice.address,
          this.mocks.mockUsdc.address,
          amount
        );
    });

    //check s_accountToTokenDeposits
    it(`should update the s_accountToTokenDeposits variable properly`, async function () {
      const previousAccountToTokenDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );

      const amount: BigNumber = parseEther(`1`);

      await this.lending
        .connect(this.signers.alice)
        .deposit(this.mocks.mockUsdc.address, amount);

      const currentAccountToTokenDeposits: BigNumber =
        await this.lending.s_accountToTokenDeposits(
          this.signers.alice.address,
          this.mocks.mockUsdc.address
        );

      //assert function is not able to handle the bignumber
      assert(
        currentAccountToTokenDeposits.toBigInt() ===
          previousAccountToTokenDeposits.add(amount).toBigInt(),
        `values are not equal, new values should be equal to previous + amount`
      );
    });

    it(`should revert TransferFailed error`, async function () {
      await this.mocks.mockUsdc.mock.transferFrom.returns(false);

      const amount = parseEther(`1`);
      await expect(
        this.lending
          .connect(this.signers.alice)
          .deposit(this.mocks.mockUsdc.address, amount)
      ).to.be.revertedWith(`TransferFailed`);
    });
  });
};
