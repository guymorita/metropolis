## Reentrancy attacks

Using `.transfer()` instead of `require(msg.sender.call.value()());` which prevents a recursive fallback function.

``` solidity
    require(balanceToWithdraw >= 0, "You must have a balance to be able to withdraw");

    s.balanceInWei = 0;
    s.storeOwner.transfer(balanceToWithdraw);
```

## Integer Overflow / Underflow

The only functions that deal with balances, `buyItem` and `withdrawBalance` also don't take any quantiative inputs from the user (not including ids).

## Denial of Service - Revert

Transfer is the last call made in the `withdrawBalance` function.

``` solidity
    require(balanceToWithdraw >= 0, "You must have a balance to be able to withdraw");

    s.balanceInWei = 0;
    s.storeOwner.transfer(balanceToWithdraw);
```

## DoS with Block Gas Limit

The two for loops included are only for emitting events. They are not vital to contract. This prevents attacks iterating over an array with an undetermined length.

## Force sending ether

None of the logic depends on the contract's balance.
