pragma solidity ^0.4.23;

contract Metropolis {
    address admin;
    mapping(address => bool) storeOwners;
    mapping (uint => Store) stores;
    mapping (uint => uint) itemCountAtStore;

    uint storeCount = 0;

    constructor() public {
        admin = msg.sender;
        storeOwners[admin] = true;
    }

    // Structs

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

    // Modifiers

    function isAdmin() private view returns (bool) {
        return msg.sender == admin;
    }

    modifier onlyAdmin() {
        require(isAdmin());
        // TODO: Why the _;
        _;
    }

    function isStoreOwner() private view returns (bool) {
        return storeOwners[msg.sender];
    }

    modifier onlyStoreOwners() {
        require(isStoreOwner());
        _;
    }

    // Events

    event LogStore(uint storeId, address storeOwner, string name);
    event LogItem(uint itemId, address owner, bool isForSale, string name, string imgUrl, uint priceInWei);

    // External Functions

    function getRole() public view returns (string) {
        if (isAdmin()) {
            return "admin";
        } else if (isStoreOwner()) {
            return "storeOwner";
        } else {
            return "visitor";
        }
    }

    function addStoreOwner(address newStoreOwner) public onlyAdmin returns (bool) {
        storeOwners[newStoreOwner] = true;
        return true;
    }

    function createStore(string nameOfStore) public onlyStoreOwners returns (uint storeId) {
        storeId = storeCount++;

        stores[storeId] = Store(storeId, msg.sender, nameOfStore, 0);

        return storeId;
    }

    function addItem(uint storeId, string name, string imgUrl, uint priceInWei) public onlyStoreOwners returns (uint itemId) {
        // require that the store owner is the correct owner
        Store storage s = stores[storeId];
        address sender = msg.sender;
        require(s.storeOwner == sender);

        itemId = itemCountAtStore[storeId]++;

        s.items[itemId] = Item(itemId, sender, true, name, imgUrl, priceInWei);

        return itemId;
    }

    function buyItem(uint storeId, uint itemId) public payable returns (bool) {
        Store storage s = stores[storeId];
        Item storage i = s.items[itemId];

        require(msg.value >= i.priceInWei);

        s.balanceInWei = s.balanceInWei + msg.value;

        i.owner = msg.sender;

        return true;
    }

    // Emit

    function emitStores() public {
        for (uint i = 0; i < storeCount; i++) {
            Store storage s = stores[i];
            emit LogStore(
                s.storeId,
                s.storeOwner,
                s.name
            );
        }
    }

    function emitItemsWithStoreId(uint storeId) public {
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