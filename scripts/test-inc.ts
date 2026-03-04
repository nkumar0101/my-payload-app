import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const payload = await getPayload({ config })

try {
  const result = await payload.find({ collection: 'products', limit: 1 })
  const product = result.docs[0]
  console.log('Product before:', product?.title, 'inventory:', product?.inventory)

  await payload.db.updateOne({
    id: product.id,
    collection: 'products',
    data: {
      inventory: { $inc: -1 } as any,
    },
  })

  const after = await payload.findByID({ collection: 'products', id: product.id })
  console.log('Product after:', after?.title, 'inventory:', after?.inventory)
} catch (err: any) {
  console.error('ERROR:', err.message)
}

process.exit(0)
