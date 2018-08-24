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
        uint price;
    }

    struct Store {
        uint storeId;
        address storeOwner;
        string name;
        mapping (uint => Item) items;
    }

    // Modifiers

    modifier onlyAdmin() {
        require(msg.sender == admin);
        // TODO: Why the _;
        _;
    }

    modifier onlyStoreOwners() {
        require(storeOwners[msg.sender]);
        _;
    }

    // Events

    event LogStore(uint storeId, address storeOwner, string name);
    event LogItem(uint itemId, address owner, bool isForSale, string name, string imgUrl, uint price);

    // Functions

    function addStoreOwner(address newStoreOwner) onlyAdmin {
        storeOwners[newStoreOwner] = true;
    }

    function createStore(string nameOfStore) onlyStoreOwners returns (uint storeId) {
        storeId = storeCount++;

        stores[storeId] = Store(storeId, msg.sender, nameOfStore);

        return storeId;
    }

    function addItem(uint storeId, string name, string imgUrl, uint price) onlyStoreOwners returns (uint itemId) {
        // require that the store owner is the correct owner
        Store storage s = stores[storeId];
        address sender = msg.sender;
        require(s.storeOwner == sender);

        itemId = itemCountAtStore[storeId]++;

        s.items[itemId] = Item(itemId, sender, true, name, imgUrl, price);

        return itemId;

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
                it.price
            );
        }
    }
}