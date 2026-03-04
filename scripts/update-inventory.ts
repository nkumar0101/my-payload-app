import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const payload = await getPayload({ config })

// Update all products without variants to have inventory
const products = await payload.find({ collection: 'products', limit: 100, depth: 1 })

console.log(`Found ${products.totalDocs} products`)

for (const product of products.docs) {
  if (!product.enableVariants) {
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { inventory: 50 },
    })
    console.log(`Updated product: ${product.title} — inventory: 50`)
  } else {
    console.log(`Skipping ${product.title} (has variants, inventory is per-variant)`)
  }
}

// Update all variants to have inventory
const variants = await payload.find({ collection: 'variants', limit: 200, depth: 0 })

console.log(`\nFound ${variants.totalDocs} variants`)

for (const variant of variants.docs) {
  if (!variant.inventory || variant.inventory === 0) {
    await payload.update({
      collection: 'variants',
      id: variant.id,
      data: { inventory: 50 },
    })
    console.log(`Updated variant ${variant.id} — inventory: 50`)
  } else {
    console.log(`Variant ${variant.id} already has inventory: ${variant.inventory}`)
  }
}

console.log('\nDone!')
process.exit(0)
