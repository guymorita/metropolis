

App = {
  web3Provider: null,
  contracts: {},
  stores: [],

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
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
        var account = accounts[0];

        App.contracts.Metropolis.deployed().then(function(instance) {
          adoptionInstance = instance;
          console.log('instance', instance);
        })
      })
      App.getStores()
      return App.markAdopted;
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-new-store-name', App.createStore)
  },

  createStore: () => {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      var name = $('.new-store-name').val()

      App.contracts.Metropolis.deployed().then(function (instance) {
        metro = instance;
        return metro.createStore(name, { from: account });
      }).then(function (data) {
        return App.getStores();
      }).catch(function (error) {
        console.log('error: ', error);
      });
    });
  },

  getStores: function() {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      App.contracts.Metropolis.deployed().then(function (instance) {
        metro = instance;
        return metro.emitStores({ from: account });
      }).then(function (data) {
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
      });
    });

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
      storeTemplate.find('.btn-adopt').attr('data-id', store.id);

      storesRow.append(storeTemplate.html());
    }
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Metropolis.deployed().then(function(instance) {
      adoptionInstance = instance;
      debugger;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Metropolis.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
