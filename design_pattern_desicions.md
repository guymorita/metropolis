## Fail early and fail loud

`require` statements are used as early as possible in functions. The only exceptions are when lookups are done or variables are renamed.

``` solidity
    function buyItem(
        uint storeId,
        uint itemId
    )
        external
        payable
        onlyIfContractNotStopped
        returns (bool)
    {
        Store storage s = stores[storeId];
        Item storage i = s.items[itemId];

        require(msg.value == i.priceInWei, "Please send the exact price of the item");

        s.balanceInWei = s.balanceInWei + msg.value;
        i.owner = msg.sender;

        return true;
    }
```

## Restricting Access

Modifiers such as `onlyAdmin` and `onlyStoreOwners` limit access to private functions.

``` solidity
    function isAdmin() private view returns (bool) {
        return msg.sender == admin;
    }
    ...
    modifier onlyAdmin() {
        require(isAdmin(), "Admin required");
        _;
    }
    ...
    function createStore(
        string nameOfStore,
        address storeOwner
    )
        external
        onlyAdmin
    ...

```

## Auto deprecation

Not used.

## Mortal

Kill switch added for admin.

``` solidity
    function kill() external onlyAdmin {
        selfdestruct(admin);
    }
```

## Pull over Push Payments

Used withdrawal pattern. `.transfer()` is the last function call in withdrawal balance.

``` solidity
    function withdrawBalance(
        uint storeId
    )
        external
        onlyStoreOwners
        onlyIfContractNotStopped
        returns (bool)
    {
        Store storage s = stores[storeId];
        uint balanceToWithdraw = s.balanceInWei;

        require(balanceToWithdraw >= 0, "You must have a balance to be able to withdraw");

        s.balanceInWei = 0;
        s.storeOwner.transfer(balanceToWithdraw);

        return true;
    }
```

## Circuit Breaker

Used a circuit breaker which the admin can toggle on / off.

``` solidity
    bool private contractStopped = false;
    ...
    modifier onlyIfContractNotStopped() {
        require(contractStopped == false, "Contract is stopped");
        _;
    }
```

## State Machine

Not used.

## Speed Bump

Not used.

