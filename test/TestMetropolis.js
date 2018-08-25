const Metropolis = artifacts.require('./Metropolis.sol')

const STORE_NAME = 'Zelda'

contract('Metropolis', ([admin, owner, visitor]) => {
    let metropolis

    const createStore = async () => {
        await metropolis.createStore(STORE_NAME, owner, { from: admin })
    }

    const addItem = async () => {
        await metropolis.addItem(
            0,
            "Sword",
            "image",
            1000000000000000000
        )
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

})
