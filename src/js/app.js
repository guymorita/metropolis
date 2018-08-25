WEI_IN_ETH = 1000000000000000000

App = {
  web3Provider: null,
  account: null,
  instance: null,
  contracts: {},
  stores: [],
  items: [],

  init: function() {
    return App.initWeb3()
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }

    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Metropolis.json', function(data) {
      var MetropolisArtifact = data;
      App.contracts.Metropolis = TruffleContract(MetropolisArtifact);

      App.contracts.Metropolis.setProvider(App.web3Provider);

      web3.eth.getAccounts(function(err, accounts) {
        App.account = accounts[0];

        App.contracts.Metropolis.deployed().then(function(instance) {
          App.instance = instance;
          return App.getStores()
        })
      })
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-new-store-name', App.createStore)
    $(document).on('click', '.btn-view-store', App.getItemsWithE)
    $(document).on('click', '.btn-add-item', App.addItem)
    // $(document).on('click', '.btn-buy-item', App.viewStore)
    // $(document).on('click', '.btn-withdraw-funds', App.viewStore)
  },

  createStore: (e) => {
    e.preventDefault()
    App.instance.createStore(name, { from: account })
      .then(function (data) {
        return App.getStores();
      }).catch(function (error) {
        console.log('error: ', error);
      })
    return false
  },

  getStores: function() {
    App.instance.emitStores({ from: App.account })

      .then(function (data) {
        const logs = data.logs
        const storeLogs = []
        for (i = 0; i < logs.length; i ++) {
          storeLogs.push(logs[i].args)
        }
        return App.stores = storeLogs
      }).then(function(stores){
        return App.displayStores()
      }).catch(function (error) {
        console.log('error: ', error);
      })
    return false
  },

  displayStores: () => {
    const stores = App.stores
    for (i = 0; i < stores.length; i ++) {
      const store = stores[i]

      var storesRow = $('#storeRow');
      var storeTemplate = $('#storeTemplate');

      storeTemplate.find('.panel-title').text(store.name);
      storeTemplate.find('img').attr('src', store.picture);
      storeTemplate.find('.store-breed').text(store.storeOwner);
      storeTemplate.find('.store-age').text(store.storeId);
      storeTemplate.find('.btn-adopt').attr('data-id', store.storeId);

      storesRow.append(storeTemplate.html());
    }
    return false
  },

  addItem: (e) => {
    e.preventDefault()
    const name = $('.add-item-name').val()
    const storeId = $('.add-item-store-id').val()
    const imgUrl = $('.add-item-img-url').val()
    const priceInEth = $('.add-item-price').val()

    const priceInWei = Number(priceInEth) * WEI_IN_ETH;

    App.instance.addItem(Number(storeId), name, imgUrl, priceInWei, { from: App.account })
      .then(function(data) {
        alert('successfully added item ' + name)
        App.getItems(storeId)
        return
      }).catch(function (error) {
        console.log('error: ', error);
      });
    return false
  },

  getItemsWithE: (e) => {
    e.preventDefault();
    const storeId = Number(e.currentTarget.dataset.id)
    App.getItems(storeId)
    return false
  },

  getItems: (storeId) => {
    App.instance.emitItemsWithStoreId(storeId, { from: App.account })
      .then(function(data) {
        data.logs[0].args
        const logs = data.logs
        const itemLogs = []
        for (i = 0; i < logs.length; i++ ){
          itemLogs.push(logs[i].args)
        }
        return App.items = itemLogs
      }).then(function() {
        return App.displayItems()
      }).catch(function (error) {
        console.log('error: ', error);
      });
    return false
  },

  displayItems: () => {
    const items = App.items
    for (i = 0; i < items.length; i ++) {
      const item = items[i]

      var itemsRow = $('#itemRow');
      itemsRow.show()
      var itemTemplate = $('#itemTemplate');

      itemTemplate.find('.panel-item-title').text(item.name);

      itemsRow.append(itemTemplate.html());
    }
    return false
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
