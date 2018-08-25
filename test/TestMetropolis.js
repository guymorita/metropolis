const Metropolis = artifacts.require('./Metropolis.sol')

const STORE_NAME = 'Zelda'
const ITEM_NAME = 'Blade of Evils Bane'
const PRICE_OF_ITEM = 5000000000000000000


contract('Metropolis', ([admin, owner, visitor]) => {
    let metropolis

    const createStore = async () => {
        await metropolis.createStore(STORE_NAME, owner, { from: admin })
    }

    const addItem = async () => {
        await metropolis.addItem(
            0,
            ITEM_NAME,
            "image",
            PRICE_OF_ITEM,
            { from: owner }
        )
    }

    const buyItem = async (itemId) => {
        await metropolis.buyItem(0, itemId, { from: visitor, value: PRICE_OF_ITEM })
    }

    beforeEach(async () => {
        metropolis = await Metropolis.new({ from: admin })
    })

    it('should be an admin', async () => {
        const role = await metropolis.getRole({ from: admin })
        assert.equal('admin', role)
    })

    it('should be a store owner', async () => {
        await createStore()
        const role = await metropolis.getRole({ from: owner })
        assert.equal('storeOwner', role)
    })

    it('should be a visitor', async () => {
        const role = await metropolis.getRole({ from: visitor })
        assert.equal('visitor', role)
    })

    it('should show store', async () => {
        await createStore()
        const data = await metropolis.emitStores({ from: admin })
        const store = data.logs[0].args
        assert.equal(STORE_NAME, store.name)
    })

    it('should add item', async () => {
        await createStore()
        await addItem()
        const data = await metropolis.emitItemsWithStoreId(0, { from: admin })
        const item = data.logs[0].args
        assert.equal(ITEM_NAME, item.name)
    })

    it('should buy item', async () => {
        await createStore()
        await addItem()
        const itemCount = Number(await metropolis.getItemCountAtStore(0, { from: admin }))
        const itemId = itemCount - 1

        await buyItem(itemId)
        const data = await metropolis.emitItemsWithStoreId(0, { from: admin })
        const item = data.logs[0].args
        assert.equal(ITEM_NAME, item.name)
        assert.equal(visitor, item.owner)
    })

    it('should withdraw balance', async () => {
        const balanceBefore = Number(await web3.eth.getBalance(visitor))
        await createStore()
        await addItem()
        const itemCount = Number(await metropolis.getItemCountAtStore(0, { from: admin }))
        const itemId = itemCount - 1
        await buyItem(itemId)

        const storeBalance = Number(await metropolis.getBalanceOfStore(0, { from: admin }))
        await metropolis.withdrawBalance(0, { from: owner, gas: 4000000 })
        const storeBalanceAfter = Number(await metropolis.getBalanceOfStore(0, { from: admin }))
        const differenceInBalance = storeBalance - storeBalanceAfter
        assert.equal(differenceInBalance, PRICE_OF_ITEM)
    })

    it('should fail if circuit breaker is on', async () => {
        await metropolis.toggleContractStopped({ from: admin })
        await createStore()
        try {
            await addItem()
        } catch (err) {
            assert.equal('StatusError', err.name)
        }
    })
})
