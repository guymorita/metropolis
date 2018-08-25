WEI_IN_ETH = 1000000000000000000

App = {
  web3Provider: null,
  account: null,
  instance: null,
  contracts: {},
  stores: [],
  items: [],
  storeIdSelected: null,
  role: null,

  init: () => {
    return App.initWeb3()
  },

  initWeb3: () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545')
    }

    web3 = new Web3(App.web3Provider)

    return App.initContract()
  },

  initContract: () => {
    $.getJSON('Metropolis.json', (data) => {
      const MetropolisArtifact = data
      App.contracts.Metropolis = TruffleContract(MetropolisArtifact)

      App.contracts.Metropolis.setProvider(App.web3Provider)

      web3.eth.getAccounts((err, accounts) => {
        App.account = accounts[0]

        App.contracts.Metropolis.deployed().then((instance) =>{
          App.instance = instance
          return App.instance.getRole({ from: App.account })
        }).then(((data) => {
          App.role = data

          App.displayAdminAndOwners()
          return App.getStores()
        }))
      })
    })

    return App.bindEvents()
  },

  bindEvents: () => {
    $(document).on('click', '.btn-new-store-name', App.createStore)
    $(document).on('click', '.btn-view-store', App.getItemsWithE)
    $(document).on('click', '.btn-add-item', App.addItem)
    $(document).on('click', '.btn-buy-item', App.buyItem)
    $(document).on('click', '.btn-withdraw-balance', App.withdrawBalance)
  },

  // Getters

  getStores: () => {
    App.instance.emitStores({ from: App.account })
      .then((data) => {
        const logs = data.logs
        const storeLogs = []
        for (i = 0; i < logs.length; i ++) {
          storeLogs.push(logs[i].args)
        }
        return App.stores = storeLogs
      }).then((stores) => {
        return App.displayStores()
      }).catch((error) => {
        console.log('error: ', error)
      })
    return false
  },

  getItemsWithE: (e) => {
    e.preventDefault()
    const storeId = Number(e.currentTarget.dataset.id)
    App.getItems(storeId)
    return false
  },

  getItems: (storeId) => {
    App.storeIdSelected = storeId
    App.instance.emitItemsWithStoreId(storeId, { from: App.account })
      .then((data) => {
        data.logs[0].args
        const logs = data.logs
        const itemLogs = []
        for (i = 0; i < logs.length; i++ ){
          itemLogs.push(logs[i].args)
        }
        return App.items = itemLogs
      }).then(() => {
        return App.displayItems()
      }).catch((error) => {
        console.log('error: ', error)
      })
    return false
  },

  // Actions

  createStore: (e) => {
    e.preventDefault()
    const name = $('.new-store-name').val()
    const address = $('.new-store-owner-address').val()

    App.instance.createStore(name, address, { from: App.account })
      .then((data) => {
        return App.getStores()
      }).catch((error) => {
        console.log('error: ', error)
      })
    return false
  },

  addItem: (e) => {
    e.preventDefault()
    const name = $('.add-item-name').val()
    const storeId = $('.add-item-store-id').val()
    const imgUrl = $('.add-item-img-url').val()
    const priceInEth = $('.add-item-price').val()

    const priceInWei = Number(priceInEth) * WEI_IN_ETH

    App.instance.addItem(Number(storeId), name, imgUrl, priceInWei, { from: App.account })
      .then((data) => {
        alert('successfully added item ' + name)
        App.getItems(storeId)
        return
      }).catch((error) => {
        console.log('error: ', error)
      })
    return false
  },

  buyItem: (e) => {
    e.preventDefault()

    const data = e.currentTarget.dataset
    const itemId = data.id
    const priceInWei = Number(data.price)
    const storeId = App.storeIdSelected

    App.instance.buyItem(storeId, itemId, { from: App.account, value: priceInWei })
      .then((data) => {
        alert('successfully purchased item!')
        App.getItems(storeId)
        return
      }).catch((error) => {
        console.log('error: ', error)
      })
    return false
  },

  withdrawBalance: (e) => {
    e.preventDefault()

    const storeId = Number($('.withdraw-balance-store-id').val())

    App.instance.withdrawBalance(storeId, { from: App.account, gas: 4000000 })
      .then((data) => {
        alert('successfully withdrew balance!')
        return
      }).catch((error) => {
        console.log('error: ', error)
      })
    return false
  },

  // Display

  displayAdminAndOwners: () => {
    const role = App.role
    if (role === 'admin' || role === 'storeOwner') {
      $('.owner-only').show()
    } else {
      $('.owner-only').hide()
    }

    if (role === 'admin') {
      $('.admin-only').show()
    } else {
      $('.admin-only').hide()
    }
  },

  displayStores: () => {
    const stores = App.stores
    const storesRow = $('#storeRow')
    storesRow.empty()
    const storeTemplate = $('#storeTemplate')

    for (i = 0; i < stores.length; i ++) {
      const store = stores[i]

      storeTemplate.find('.panel-title').text(store.name)
      storeTemplate.find('img').attr('src', store.picture)
      storeTemplate.find('.store-address').text(store.storeOwner)
      storeTemplate.find('.store-id').text(store.storeId)
      storeTemplate.find('.btn-view-store').attr('data-id', store.storeId)

      storesRow.append(storeTemplate.html())
    }
    return false
  },

  displayItems: () => {
    const items = App.items
    const itemsRow = $('#itemRow')
    itemsRow.empty()
    itemsRow.show()
    const itemTemplate = $('#itemTemplate')
    const itemsTitle = $('.items-title')
    const storeName = App.stores[App.storeIdSelected].name
    itemsTitle.text('Items at ' + storeName)
    itemsTitle.show()

    for (i = 0; i < items.length; i ++) {
      const item = items[i]

      const priceInEth = item.priceInWei / WEI_IN_ETH

      itemTemplate.find('.panel-item-title').text(item.name)
      itemTemplate.find('img').attr('src', item.imgUrl)
      itemTemplate.find('.item-owner').text(item.owner)
      itemTemplate.find('.item-id').text(item.itemId)
      itemTemplate.find('.item-price').text(priceInEth)
      itemTemplate.find('.btn-buy-item').attr('data-id', item.itemId)
      itemTemplate.find('.btn-buy-item').attr('data-price', item.priceInWei)

      itemsRow.append(itemTemplate.html())
    }
    return false
  }
}

$(() => {
  $(window).load(() => {
    App.init()
  })
})
