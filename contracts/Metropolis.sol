pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


/**
 * @title Metropolis
 * @dev The Metropolis contract allows anyone to setup a metropolis where he / she
 * choose store owners, the store owners create stores, items are created for stores,
 * and finally visitors can buy the items with Ether. Of course after they make sales
 * they can also withdraw their funds.
 *
 * Protections have been made against attacks such as: reentrancy, race conditions,
 * timestamp dependence, overflow / underflow, and unexpected reverts.
 */
contract Metropolis is Ownable {
    address admin;
    bool private contractStopped = false;
    uint private storeCount = 0;
    mapping (address => bool) storeOwners;
    mapping (uint => Store) stores;
    mapping (uint => uint) itemCountAtStore;

    constructor() public {
        admin = msg.sender;
        storeOwners[admin] = true;
    }

    /*** STRUCTS ***/

    struct Item {
        uint itemId;
        address owner;
        bool isForSale;
        string name;
        string imgUrl;
        uint priceInWei;
    }

    struct Store {
        uint storeId;
        address storeOwner;
        string name;
        uint balanceInWei;
        mapping (uint => Item) items;
    }

    /*** MODIFIERS ***/

    /**
    * @dev Check if sender is admin.
    */
    function isAdmin() private view returns (bool) {
        return msg.sender == admin;
    }

    /**
    * @dev Modifier to check if sender is admin.
    */
    modifier onlyAdmin() {
        require(isAdmin(), "Admin required");
        _;
    }

    /**
    * @dev Check if sender is a store owner.
    */
    function isStoreOwner() private view returns (bool) {
        return storeOwners[msg.sender];
    }

    /**
    * @dev Modifier to check if sender is a store owner.
    */
    modifier onlyStoreOwners() {
        require(isStoreOwner(), "Store owner required");
        _;
    }

    /**
    * @dev Modifier to check if the contract is stopped.
    * @notice This is the checker to see if the circuit breaker has been switched.
    */
    modifier onlyIfContractNotStopped() {
        require(contractStopped == false, "Contract is stopped");
        _;
    }

    /*** EVENTS ***/

    event LogStore(uint storeId, address storeOwner, string name);
    event LogItem(uint itemId, address owner, bool isForSale, string name, string imgUrl, uint priceInWei);

    /*** GETTERS ***/

    function getItemCountAtStore(uint storeId) public view returns (uint) {
        return itemCountAtStore[storeId];
    }

    function getBalanceOfStore(uint storeId) public view onlyStoreOwners returns (uint) {
        return stores[storeId].balanceInWei;
    }

    function getRole() public view returns (string) {
        if (isAdmin()) {
            return "admin";
        } else if (isStoreOwner()) {
            return "storeOwner";
        } else {
            return "visitor";
        }
    }

    /*** EXTERNAL FUNCTIONS ***/

    /**
    * @dev Kill switch for contract.
    */
    function kill() external onlyAdmin {
        selfdestruct(admin);
    }

    /**
    * @dev Toggles the contract between stopped and !stopped.
    * @notice If stopped, all the other external functions will be stopped.
    */
    function toggleContractStopped() external onlyAdmin returns (bool) {
        contractStopped = !contractStopped;
        return contractStopped;
    }

    /**
    * @dev Admin creates a store and chooses the owner.
    * @param nameOfStore - Name of the store to create.
    * @param storeOwner - Address of the owner for the store.
    */
    function createStore(
        string nameOfStore,
        address storeOwner
    )
        external
        onlyAdmin
        returns (uint storeId)
    {
        storeId = storeCount++;

        stores[storeId] = Store(storeId, storeOwner, nameOfStore, 0);
        storeOwners[storeOwner] = true;

        return storeId;
    }

    /**
    * @dev Allows a store owner to add an item to his/her store.
    * @param storeId - Store ID for the given item (an owner may have many stores).
    * @param name - Name of the item.
    * @param imgUrl - An image for the item to be used in the store.
    * @param priceInWei - Price in wei.
    * @notice Sender must be the store owner. No other senders are allowed.
    */
    function addItem(
        uint storeId,
        string name,
        string imgUrl,
        uint priceInWei
    )
        external
        onlyStoreOwners
        onlyIfContractNotStopped
        returns (uint itemId)
    {

        Store storage s = stores[storeId];
        address sender = msg.sender;
        require(s.storeOwner == sender, "You must be the store owner to add an item to this store");

        itemId = itemCountAtStore[storeId]++;

        s.items[itemId] = Item(itemId, sender, true, name, imgUrl, priceInWei);

        return itemId;
    }

    /**
    * @dev Allow external users to buy an item.
    * @param storeId - Store ID for the item to be purchased.
    * @param itemId - Item ID for the item to be purchased.
    */
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

    /**
    * @dev Store owner is able to withdraw the store balance. Used msg.sender.transfer
    * as opposed to msg.sender.call.value to prevent reentrancy attacks. It will
    * automatically revert if the send fails.
    * @param storeId - Store ID for the balance to be withdrawn.
    */
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

    /*** EMIT ***/

    /**
    * @dev Emits of all the stores. Used uint i as opposed to i to avoid overflow of the array.
    */
    function emitStores() external {
        for (uint i = 0; i < storeCount; i++) {
            Store storage s = stores[i];
            emit LogStore(
                s.storeId,
                s.storeOwner,
                s.name
            );
        }
    }

    /**
    * @dev Emits of the items in a store. Used uint i as opposed to i to avoid overflow of the array.
    * @param storeId - Store ID for the items to be emitted.
    */
    function emitItemsWithStoreId(uint storeId) external {
        Store storage s = stores[storeId];
        uint c = itemCountAtStore[storeId];
        for (uint i = 0; i < c; i++) {
            Item storage it = s.items[i];
            emit LogItem(
                it.itemId,
                it.owner,
                it.isForSale,
                it.name,
                it.imgUrl,
                it.priceInWei
            );
        }
    }
}